import { Component } from "./models/component";

const componentModule = require('./component.ts');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<html lang="en"><body><div id="root"></div></body></html>`);
console.log(dom.window.document.querySelector("#root").textContent); // "Hello world"

generateHTMLForComponents([{id: '123', tag: 'nym-container', template: '<span>NYMPHEAS</span>'}], '123');

function generateHTMLForComponents(components: Component[], rootComponentId: string) {
    (components || []).forEach(component => componentModule.registerComponent(component));
    
    const rootComponent: Component = componentModule.getComponent(rootComponentId);

    if (!rootComponent) {
        throw new TypeError(`Root component ${rootComponentId} not found`);
    }

    insertRootComponent(dom.window.document, rootComponent);
    return 'HTML';
}

function insertRootComponent(document: Document, rootComponent: Component): void {
    //  Create component container
    const rootComponentElm: HTMLElement = document.createElement('div');
    rootComponentElm.setAttribute('id', `nym-component-${rootComponent.id}`);
    rootComponentElm.innerHTML = rootComponent.template;

    //  Insert container in root
    document.querySelector('#root')?.appendChild(rootComponentElm);
    
    console.log(dom.window.document.querySelector(`#root`).outerHTML)
}