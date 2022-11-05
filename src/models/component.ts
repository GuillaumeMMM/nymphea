export type Component = {
    id: string;
    tag: string;
    template: string | HTMLElement;
    styles?: string;
    data?: ComponentData;
}

export type ComponentNode = {
    componentId: string;
    children: ComponentNode[];
}

export type ComponentData = {
    [key: string]: any
}