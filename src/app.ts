import { Component, ComponentNode } from "./models/component";

const componentModule = require('./component.ts');
const treeModule = require('./tree.ts');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);

function generateHTMLForComponents(components: Component[], rootComponentId: string): string {
    (components || []).forEach(component => componentModule.registerComponent(component));
    
    const rootComponent: Component = componentModule.getComponent(componentModule.cleanComponentId(rootComponentId));

    if (!rootComponent) {
        throw new TypeError(`Root component ${rootComponentId} not found`);
    }

    insertRootComponent(dom.window.document, rootComponent);

    const componentsRootNode: ComponentNode = {componentId: rootComponent.id, children: []};
    const componentsTree: ComponentNode = treeModule.buildComponentTree(componentsRootNode, components);

    insertChildren(componentsTree, dom.window.document, components);

    return dom.window.document.getElementById('root').innerHTML;
}

function insertRootComponent(document: Document, rootComponent: Component): void {
    //  Create component container
    const rootComponentElm: HTMLElement = document.createElement('div');
    rootComponentElm.setAttribute('id', `nym-component-${rootComponent.id}`);
    rootComponentElm.innerHTML = rootComponent.template;

    //  Insert container in root
    document.querySelector('#root')?.appendChild(rootComponentElm);
}

function insertChildren(node: ComponentNode, document: Document, components: Component[]): void {
    const matchingComp: Component = components.find(comp => comp.id === node.componentId) as Component;

    if (matchingComp) {
        //  Create component container
        const componentElm: HTMLElement = document.createElement('div');
        componentElm.setAttribute('id', `nym-component-${node.componentId}`);
        componentElm.innerHTML = matchingComp.template || '';

        //  Insert container in root for each matching Elm
        const matchingTags: NodeList = document.querySelectorAll(matchingComp.tag);

        if (matchingTags.length > 0) {
            matchingTags.forEach((matchingTag) => {
                if (matchingTag?.parentElement) {
                    matchingTag.parentElement.replaceChild(componentElm.cloneNode(), matchingTag);
                }
            });
        }
    }

    (node?.children || []).forEach(child => {
        insertChildren(child, document, components);
    });
}

module.exports = {
    generateHTML: generateHTMLForComponents
}