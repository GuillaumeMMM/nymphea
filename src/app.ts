import { Component, ComponentData, ComponentNode } from "./models/component";

const componentModule = require('./component');
const treeModule = require('./tree');
const dataModule = require('./data');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const prefixer = require('postcss-prefix-selector');
const postcss = require('postcss');

function generateHTML(components: Component[], rootComponentTag: string): string {

    const cleanedCompoents: Component[] = componentModule.cleanComponents(components);

    //  Define global DOM
    const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);
    
    const rootComponent: Component = componentModule.getComponentFromTag(cleanedCompoents, rootComponentTag);

    if (!rootComponent) {
        throw new TypeError(`Root component ${rootComponentTag} not found`);
    }

    const rootElement: HTMLElement = dom.window.document.querySelector('#root');

    return buildRootNode(dom.window.document, rootElement, rootComponent, cleanedCompoents).innerHTML;
}

function generateCSS(components: Component[]): string {

    const cleanedCompoents: Component[] = componentModule.cleanComponents(components);

    let css: string = '';

    cleanedCompoents.filter(comp => comp.styles).forEach(comp => {

        const out = postcss().use(prefixer({
            prefix: `.nym-component-${comp.id}`,
            exclude: ['.c'],
        })).process(comp.styles).css

        css += ` ${out}`;
    });
    return css;
}

function getComponentsTree(components: Component[], rootComponentTag: string): ComponentNode {
    const cleanedCompoents: Component[] = componentModule.cleanComponents(components);

    const rootComponent: Component = componentModule.getComponentFromTag(cleanedCompoents, rootComponentTag);

    const componentsRootNode: ComponentNode = {componentId: rootComponent.id, children: []};

    return treeModule.buildComponentTree(componentsRootNode, cleanedCompoents);
}

function buildRootNode(document: Document, rootElement: HTMLElement, rootComponent: Component, components: Component[]): HTMLElement {
    //  Insert the root component in the DOM root
    rootElement = insertRootComponent(document, rootElement, rootComponent).cloneNode(true) as HTMLElement;

    //  Build a tree of dependencies
    const componentsTree: ComponentNode = getComponentsTree(components, rootComponent.tag);

    //  Insert all child nodes
    rootElement = insertChildren(document, rootElement, componentsTree, components);

    return rootElement;
}

function insertRootComponent(document: Document, rootElement: HTMLElement, rootComponent: Component): HTMLElement {
    const newRootElement: HTMLElement = (rootElement.cloneNode(true) as HTMLElement);

    //  Create component container
    let rootComponentElm: HTMLElement = document.createElement('div');
    rootComponentElm.classList.add(`nym-component-${rootComponent.id}`);
    if (typeof rootComponent.template === 'string') {
        rootComponentElm.innerHTML = rootComponent.template;
    } else {
        rootComponentElm.appendChild(rootComponent.template);
    }

    rootComponentElm = dataModule.insertData(rootComponentElm, rootComponent);

    //  Insert container in root
    newRootElement?.appendChild(rootComponentElm);

    return newRootElement;
}

function insertChildren(document: Document, rootElement: HTMLElement, node: ComponentNode, components: Component[]): HTMLElement {
    const matchingComp: Component = components.find(comp => comp.id === node.componentId) as Component;

    let newRootElement: HTMLElement = (rootElement.cloneNode(true) as HTMLElement);

    if (matchingComp) {
        //  Create component container
        const componentElm: HTMLElement = document.createElement('div');
        componentElm.classList.add(`nym-component-${node.componentId}`);

        if (typeof matchingComp.template === 'string') {
            componentElm.innerHTML = matchingComp.template || '';
        } else {
            componentElm.appendChild(matchingComp.template);
        }

        //  Insert container in root for each matching Elm
        const matchingTags: NodeList = newRootElement.querySelectorAll(matchingComp.tag);

        if (matchingTags.length > 0) {
            matchingTags.forEach((matchingTag) => {
                if (matchingTag?.parentElement) {
                    matchingTag.parentElement.replaceChild(componentElm.cloneNode(true), matchingTag);
                }
            });
        }
    }

    const children: ComponentNode[] = (node?.children || []);
    children.forEach(child => {
        newRootElement = insertChildren(document, newRootElement, child, components).cloneNode(true) as HTMLElement;
    });
    return newRootElement;
}

module.exports = {
    generateHTML: generateHTML,
    generateCSS: generateCSS,
    getComponentsTree: getComponentsTree
}