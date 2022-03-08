import { Component } from "./models/component";

const components: Component[] = [];

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

function cleanComponent(component: Component): Component {
    let componentId = component.id;
    componentId = componentId.replace(/^[A-Za-z][A-Za-z0-9_:\.-]*/gi, "");
    console.log('clean', component.id, componentId)
    return {
        ...component,
        id: componentId
    }
}

module.exports = {
    registerComponent: registerComponent,
    getComponent: getComponent
}