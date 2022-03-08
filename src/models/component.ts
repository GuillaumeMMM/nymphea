export class Component {
    id: string = '';
    tag: string = '';
    template: string = '';
    styles?: string;
}

export class ComponentNode {
    componentId: string = '';
    children: ComponentNode[] = [];
}