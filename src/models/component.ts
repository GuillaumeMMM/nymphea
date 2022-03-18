export class Component {
    id: string = '';
    tag: string = '';
    template: string | HTMLElement = '';
    styles?: string;
    data?: ComponentData;
}

export class ComponentNode {
    componentId: string = '';
    children: ComponentNode[] = [];
}

export class ComponentData {
    [key: string]: any
}