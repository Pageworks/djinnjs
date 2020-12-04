# Upgrading Custom Elements

[Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html) can be upgraded into [Web Components](https://www.webcomponents.org/introduction) by adding the `web-component` attribute. The JavaScript file must match the Custom Elements `tagName` value.

In the example below the `<custom-element>` will be upgraded into a Web Component. By default Web Components are lazy-loaded and the JavaScript is only requested when the Custom Element enters the viewport. If a web component needs to be loaded immediately the `loading` attribute can be set to `eager` as seen in the example below.

**NOTE:** Djinn uses the elements tag name (`el.tagName.toLowerCase()`) to create the JavaScript file url. In the example below the `custom-element.mjs` file will be dynamically imported.

```html
<custom-element web-component loading="eager">
    ...snip...
</custom-element>
```

```javascript
export default class CustomElementComponent extends HTMLElement {
    connectedCallback() {
        // Do something after web component is connected
    }
}
```

# Connection Based Loading

Prevent Web Components from loading on low-end connections using the `required-connection` attribute, the value must be a valid [Connection Type](https://wicg.github.io/netinfo/#effectiveconnectiontype-enum). Be default all Web Components require a `4g` connection.

```html
<custom-element web-component required-connection="3g">
    ...snip...
</custom-element>
```
