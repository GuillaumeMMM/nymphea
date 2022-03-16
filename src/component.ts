import { Component } from "./models/component";

const components: Component[] = [];

function cleanComponents(componentsTmp: Component[]): Component[] {
    if (!componentsTmp || componentsTmp.length === 0) {
        throw new TypeError(`No component found`);
    }
    return (componentsTmp || []).filter(component => isValidComponent(component)).map(component => cleanComponent(component));
}

function getComponentFromTag(components: Component[], componentTag: string): Component | undefined {
    return components.find(component => component.tag === componentTag);
}

function isValidComponent(component: Component): boolean {
    return !!(component?.id && component.template);
}

function isValidComponentId(componentId: string): boolean {
    return (/^[A-Za-z]+[\w\-\:\.]*$/).test(componentId);
}

function cleanComponent(component: Component): Component {
    if (!isValidComponentId(component.id)) {
        throw new TypeError(`Invalid component id ${component.id}`);
    }
    return {
        ...component,
        id: component.id
    }
}

module.exports = {
    cleanComponents: cleanComponents,
    getComponentFromTag: getComponentFromTag,
}