import { Component } from "./models/component";

const components: Component[] = [];

function registerComponents(componentsTmp: Component[]): void {
    if (!componentsTmp || componentsTmp.length === 0) {
        throw new TypeError(`No component found`);
    }
    (componentsTmp || []).forEach(component => registerComponent(component));
}

function registerComponent(component: Component): void {
    if (!isValidComponent(component)) {
        throw new TypeError(`Invalid component ${component?.id || ''}`);
    }
    components.push(cleanComponent(component));
}

function getComponents(): Component[] {
    return components;
}

function getComponent(componentId: string): Component | undefined {
    return components.find(component => component.id === componentId);
}

function isValidComponent(component: Component): boolean {
    return !!(component?.id && component.template && typeof component.template === 'string');
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
    registerComponents: registerComponents,
    getComponent: getComponent,
    getComponents: getComponents
}