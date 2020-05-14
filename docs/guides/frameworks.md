# Working With UI Frameworks

UI Frameworks such as [Vue](https://vuejs.org/), [React](https://reactjs.org/), and [Preact](https://preactjs.com/) can be used within pages to build components, however, DjinnJS does not work when building a full Single Page App (SPA) with a UI Framework. DjinnJS is designed to provide a persistent state between pages along with a messaging system for handling communication between controllers. 

If you are using a UI Framework to build an interactive component simply include the `<script>` on the page. Script elements are appended to the documents head every time the page loads. If a script should not be reloaded add the `pjax-prevent-remount` attribute to a `<script>`  that has a src , id, or `pjax-script-id` attribute.

In the example below a [React](https://reactjs.org/) component is used within a page.

```html
<div id="mounting-point"></div>
<script src="/react/example.js"></script>
```

```javascript
import React, { Component } from "react";
import { render } from "react-dom";

class ExampleComponent extends Component<> {
    render() {
        return <div>Hello world!</div>;
    }
}
render(<ExampleComponent />, document.body.querySelector("#mounting-point"));
```

See [working with NPM packages](/guides/adding-npm-packages) for additional information.