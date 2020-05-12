# Importing Resources

The preferred method of loading CSS and JavaScript is using the `fetchJS` and `fetchCSS` functions, however, sometimes an inline `<script>` or `<style>` element is needed. When inlining scripts remember to add a `defer` or `async` attribute so the script isn't blocking. To learn how to asynchronously load a `<link>` element [click here](/learn/lazy-loading#lazy-css).

## JavaScript 

When importing additional JavaScript use `fetchJS` function. The example below will showcase a Web Component loading additional JavaScript before initializing. Local files such as `jquery` and `lodash` can be requested via their filenames while external CDN hosted files are requested with their full URLs.

```javascript
import { fetchJS } from 'djinnjs/fetch';

class CustomElement extends HTMLElement
{
    init()
    {
        ...snip...
    }
        
    connectedCallback()
    {
        fetchJS(['jquery', 'lodash', `https://www.google.com/recaptcha/api.js?render=${this.dataset.publicKey}`])
            .then(() => {
                this.init();
            });
    }
}
customElements.defind('custom-element', CustomElement);
```

### Stylesheets

The same thing can be done for imporing additional CSS by using the `fetchCSS` function. In the example below only one file is being requested so there is no need to provide the filename as an array.

```javascript
import { fetchCSS } from 'djinnjs/fetch';

class CustomElement extends HTMLElement
{
    init()
    {
        ...snip...
    }
        
    connectedCallback()
    {
        fetchCSS('buttons')
            .then(() => {
                this.init();
            });
    }
}
customElements.defind('custom-element', CustomElement);
```