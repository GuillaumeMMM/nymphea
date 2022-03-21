import { Component, ComponentData } from "./models/component";

function insertData(element: HTMLElement, component: Component): HTMLElement {
    let newElement: HTMLElement = element.cloneNode(true) as HTMLElement;



    if (newElement.childNodes.length > 0) {
        newElement.childNodes.forEach((child, index) => {
            const newChild = insertDataChild(child as HTMLElement, component.data || {});
            newElement.replaceChild(newChild, child);
            
            newElement.replaceChild(insertData(newElement.childNodes[index].cloneNode(true) as HTMLElement, component), newChild)
        });

    }

    return newElement;
}

function insertDataChild(childElement: HTMLElement, data: ComponentData): HTMLElement {
    const newElement: HTMLElement = childElement.cloneNode(true) as HTMLElement;

    const regex = new RegExp(/(?<={{)[^}}[]*(?=}})/g);

    //  Replace text content
    if (newElement.nodeType === 3 && newElement.textContent) {

        Array.from(newElement.textContent.matchAll(regex)).forEach(match => {
            newElement.textContent = (newElement.textContent || '').replace(`{{${match[0]}}}`, getDescendantProp(data, match[0]) || '');
        })
    }

    //  Replace element attributes
    const attributes = newElement.attributes;

    Array.from(attributes || []).forEach(attr => {

        Array.from(attr.value.matchAll(regex)).forEach(match => {
            newElement.setAttribute(attr.name, (attr.value || '').replace(`{{${match[0]}}}`, getDescendantProp(data, match[0]) || ''));
        });
    });

    return newElement;
}

function getDescendantProp(obj: any, desc: string) {
    var arr: string[] = desc.split(".");
    while(arr.length && (obj = obj[arr.shift() as any]));
    return obj;
}

module.exports = {
    insertData: insertData,
}