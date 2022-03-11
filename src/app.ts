import { Component, ComponentNode } from "./models/component";

const componentModule = require('./component.ts');
const treeModule = require('./tree.ts');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const prefixer = require('postcss-prefix-selector');
const postcss = require('postcss');

function registerComponents(components: Component[]): void {
    componentModule.registerComponents(components);
}

function generateHTMLForRoot(rootComponentTag: string): string {

    //  Define global DOM
    const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);
    
    const rootComponent: Component = componentModule.getComponentFromTag(rootComponentTag);

    if (!rootComponent) {
        throw new TypeError(`Root component ${rootComponentTag} not found`);
    }

    const rootElement: HTMLElement = dom.window.document.querySelector('#root');

    return buildRootNode(dom.window.document, rootElement, rootComponent, componentModule.getComponents()).innerHTML;
}

function generateCSS(): string {

    let css: string = '';

    (componentModule.getComponents() as Component[]).filter(comp => comp.styles).forEach(comp => {

        const out = postcss().use(prefixer({
            prefix: `.nym-component-${comp.id}`,
            exclude: ['.c'],
        })).process(comp.styles).css

        css += ` ${out}`;
    });
    return css;
}

function buildRootNode(document: Document, rootElement: HTMLElement, rootComponent: Component, components: Component[]): HTMLElement {
    //  Insert the root component in the DOM root
    rootElement = insertRootComponent(document, rootElement, rootComponent).cloneNode(true) as HTMLElement;

    const componentsRootNode: ComponentNode = {componentId: rootComponent.id, children: []};

    //  Build a tree of dependencies
    const componentsTree: ComponentNode = treeModule.buildComponentTree(componentsRootNode, components);

    //  Insert all child nodes
    rootElement = insertChildren(document, rootElement, componentsTree, components);

    return rootElement;
}

function insertRootComponent(document: Document, rootElement: HTMLElement, rootComponent: Component): HTMLElement {
    const newRootElement: HTMLElement = (rootElement.cloneNode(true) as HTMLElement);

    //  Create component container
    const rootComponentElm: HTMLElement = document.createElement('div');
    rootComponentElm.classList.add(`nym-component-${rootComponent.id}`);
    rootComponentElm.innerHTML = rootComponent.template;

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
        componentElm.innerHTML = matchingComp.template || '';

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
    registerComponents: registerComponents,
    generateHTMLForRoot: generateHTMLForRoot,
    generateCSS: generateCSS
}