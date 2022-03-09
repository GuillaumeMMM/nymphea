# Nymphéas

Nymphéas exposes a HTML generator function that returns a sigle HTML string for a collection of nested components.


## Install
```
npm install nymphea
```

## Usage
```javascript
import { registerComponents, generateHTMLForRoot } from 'nymphea';

const components = [
    {
        tag: 'my-app-container', 
        template: `<div class='my-container-class'><my-app-child-1></my-app-child-1></div>`,
        styles: `.my-container-class { color: 'red';}`
    },
    {tag: 'my-app-child-1', template: `<span>Child 1! <my-app-child-2></my-app-child-2></span>`},
    {tag: 'my-app-child-2', template: `<span>Child 2!</span>`},
];

registerComponents(components);

//  Returns the formatted HTML string
generateHTMLForRoot('my-app-container');

//  Returns the global CSS string with encapsulation prefixes for each component
generateCSS();

```