import { Component, ComponentData } from "./models/component";

function insertData(element: HTMLElement, data: any, document: Document): HTMLElement {
    let newElement: HTMLElement = element.cloneNode(true) as HTMLElement;



    if (newElement.childNodes.length > 0) {
        newElement.childNodes.forEach((child, index) => {
            const newChild = insertDataChild(child as HTMLElement, data || {}, document);
            newElement.replaceChild(newChild, child);
            
            newElement.replaceChild(insertData(newElement.childNodes[index].cloneNode(true) as HTMLElement, data, document), newChild)
        });

    }

    return newElement;
}

function insertDataChild(childElement: HTMLElement, data: ComponentData, document: Document): HTMLElement {

    let newElement: HTMLElement = childElement.cloneNode(true) as HTMLElement;

    newElement = replaceEachDataForElement(newElement, data, document);

    newElement = replaceDataForElement(newElement, data);

    return newElement;
}

function replaceDataForElement(newElement: HTMLElement, data: any, isEach: boolean = false): HTMLElement {
    const attributes = newElement.attributes;
    const regex = isEach ? new RegExp(/(?<={{.)[^}}[]*(?=}})/g) : new RegExp(/(?<={{)[^}}[]*(?=}})/g);
    
    //  Replace text content
    if (newElement.nodeType === 3 && newElement.textContent) {
        Array.from(newElement.textContent.matchAll(regex)).forEach(match => {
            newElement.textContent = (newElement.textContent || '').replace(`{{${match[0]}}}`, getDescendantProp(data, match[0].slice(isEach ? 1 : 0)) || '');
        })
    }

    //  Replace element attributes
    Array.from(attributes || []).forEach(attr => {

        Array.from(attr.value.matchAll(regex)).forEach(match => {
            console.log('replace', `{{${match[0]}}}`, data, match[0].slice(isEach ? 1 : 0))
            newElement.setAttribute(attr.name, (attr.value || '').replace(`{{${match[0]}}}`, getDescendantProp(data, match[0].slice(isEach ? 1 : 0)) || ''));
        });
    });

    return newElement;
}

function replaceEachDataForElement(newElement: HTMLElement, data: any, document: Document): HTMLElement {
    const attributes = newElement.attributes;

    //  Replace *nymEach
    const eachAttribute = Array.from(attributes || []).find(attr => attr.name === '*nymeach');
    if (eachAttribute) {
        const eachData = getDescendantProp(data, eachAttribute.value);
        const eachParentElement: HTMLElement = document.createElement('nym-each');
        if (eachData && eachData.length > 0) {
            eachData.forEach((eachDataElm: any) => {
                const newEachElm: HTMLElement = newElement.cloneNode(true) as HTMLElement;
                newEachElm.removeAttribute('*nymeach');

                eachParentElement.appendChild(insertData(newEachElm, eachDataElm, document));
            });
            newElement = eachParentElement;
        }
    }

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