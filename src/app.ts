import { Component, ComponentNode } from "./models/component";

const componentModule = require('./component.ts');
const treeModule = require('./tree.ts');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log(generateHTMLForComponents([
    {id: 'id-1', tag: 'tag-1', template: 'TAG 1 <tag-2></tag-2>'},
    {id: 'id-2', tag: 'tag-2', template: 'TAG 2 <tag-3></tag-3>'},
    {id: 'id-3', tag: 'tag-3', template: 'TAG 3'},
], 'id-1'));

function generateHTMLForComponents(components: Component[], rootComponentId: string): string {

    componentModule.registerComponents(components);

    //  Define global DOM
    const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);
    
    const rootComponent: Component = componentModule.getComponent(rootComponentId);

    if (!rootComponent) {
        throw new TypeError(`Root component ${rootComponentId} not found`);
    }

    let rootElement: HTMLElement = dom.window.document.querySelector('#root');

    return buildRootNode(dom.window.document, rootElement, rootComponent, componentModule.getComponents()).innerHTML;
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
    rootComponentElm.setAttribute('id', `nym-component-${rootComponent.id}`);
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
        componentElm.setAttribute('id', `nym-component-${node.componentId}`);
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
    generateHTML: generateHTMLForComponents
}