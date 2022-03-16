export class Component {
    id: string = '';
    tag: string = '';
    template: string | HTMLElement = '';
    styles?: string;
}

export class ComponentNode {
    componentId: string = '';
    children: ComponentNode[] = [];
}