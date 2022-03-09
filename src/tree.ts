import { Component, ComponentNode } from "./models/component";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function buildComponentTree(rootNode: ComponentNode, components: Component[]): ComponentNode {
    const componentsDocuments: {comp: Component, doc: Document}[] = components.map(comp => { 
        return {doc: getRootElementForComponent(comp), comp: comp}
    });

    const tree = {...rootNode, children: getNodeChildren(rootNode.componentId, componentsDocuments, [])};

    return tree;
}

function getNodeChildren(componentId: string, componentsDocuments: {comp: Component, doc: Document}[], parentsIds: string[]): ComponentNode[] {

    let nodeDoc: Document = (componentsDocuments.find(compDoc => compDoc.comp.id === componentId)?.doc as Document);

    if (!nodeDoc) {
        throw new TypeError(`Node was not found`);
    }

    const children: ComponentNode[] = [];
    (componentsDocuments || []).forEach(compDoc => {
        const matchingTagElement = nodeDoc.getElementsByTagName(compDoc.comp.tag);
        if (matchingTagElement && matchingTagElement.length > 0) {
            const newParentsIds: string[] = parentsIds.concat(componentId);
            if (hasCircularDependency(compDoc.comp.id, parentsIds)) {
                throw new TypeError(`Circular dependency found (${compDoc.comp.id})`);
            }
            children.push({componentId: compDoc.comp.id, children: getNodeChildren(compDoc.comp.id, componentsDocuments, newParentsIds)});
        }
    });
    return children;
}

function hasCircularDependency(componentId: string, parentsIds: string[]): boolean {
    return parentsIds.includes(componentId);
}

function getRootElementForComponent(component: Component): Document {
    const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);

    const document: Document = dom.window.document;

    const rootComponentElm: HTMLElement = document.createElement('div');
    rootComponentElm.setAttribute('id', `nym-component-${component.id}`);
    rootComponentElm.innerHTML = component.template;

    document.querySelector('#root')?.appendChild(rootComponentElm);

    return document;
}

module.exports = {
    buildComponentTree: buildComponentTree
}