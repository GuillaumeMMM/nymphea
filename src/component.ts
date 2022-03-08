import { Component } from "./models/component";

const components: Component[] = [];

function registerComponent(component: Component): void {
    if (!isValidComponent(component)) {
        throw new TypeError(`Invalid component ${component?.id || ''}`);
    }
    components.push(cleanComponent(component));
}

function getComponent(componentId: string): Component | undefined {
    return components.find(component => component.id === componentId);
}

function isValidComponent(component: Component): boolean {
    return !!(component?.id && component.template && typeof component.template === 'string');
}

function cleanComponentId(componentId: string): string {
    return componentId.replace(/^[A-Za-z][A-Za-z0-9_:\.-]*/gi, "");
}

function cleanComponent(component: Component): Component {
    return {
        ...component,
        id: cleanComponentId(component.id)
    }
}

module.exports = {
    registerComponent: registerComponent,
    getComponent: getComponent,
    cleanComponentId: cleanComponentId
}