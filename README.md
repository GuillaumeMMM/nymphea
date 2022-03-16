# Nymphéa

Nymphéa exposes HTML and CSS generator functions that returns a sigle .html/.css string for a collection of nested components.

The HTML is parsed and validated by creating a temporary document with jsDOM, and a tree of components to check for circular dependencies. The library also exposes a function to retrieve this tree.

## Install
```
npm install nymphea
```

## Usage
```javascript
const nymphea = require('nymphea');

const components = [
    {tag: 'my-parent', id: 'node-1', template: `<div class="container">Hello World <my-child1></my-child1> <my-child2></my-child2></div>`, styles: ".container {color: 'red';}"},
    {tag: 'my-child1', id: 'node-2', template: '<span>Child 1</span>', styles: "span {color: 'blue';}"},
    {tag: 'my-child2', id: 'node-3', template: `<span>Child 2 <my-child3></my-child3></span>`, styles: "span {color: 'orange';}"},
    {tag: 'my-child3', id: 'node-4', template: '<span>Child 3</span>'},
];

const html = nymphea.generateHTML(components, 'my-parent');
//  Returns a string of all the HTML with registered components repalced with their HTML content

console.log(html);
/* <div class="nym-component-node-1">
    <div>
        Hello World 
        <div class="nym-component-node-2">
            <span>Child 1</span>
        </div> 
        <div class="nym-component-node-3">
            <span>Child 2 
                <div class="nym-component-node-4">
                    <span>Child 3</span>
                </div>
            </span>
        </div>
    </div>
</div> */


const css = nymphea.generateCSS(components);
//  Returns a string containing all the CSS with encapsulation by class

console.log(css);
/* .nym-component-node-1 .container {color: 'red';} 
.nym-component-node-2 span {color: 'blue';} 
.nym-component-node-3 span {color: 'orange';} */


const tree = nymphea.getComponentsTree(components, 'my-parent');
//  Returns the tree of components rooted on the selected tag

console.log(tree);
/* {
  componentId: 'node-1',
  children: [
    { componentId: 'node-2', children: [] },
    { componentId: 'node-3', children: [
        { componentId: 'node-4', children: [] }
    ] }
  ]
} */
```

## Models
```javascript
class Component {
    id: string;
    tag: string;
    template: string | HTMLElement;
    styles?: string;
}

class ComponentNode {
    componentId: string;
    children: ComponentNode[];
}
```

## To Do
- [x] Let the component template be a HTMLElement
- [ ] Create a nym-ignore html id attribute for parts of the temlates not to be interpreted as code