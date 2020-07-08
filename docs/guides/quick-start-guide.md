# Quick Start Guide

Get up and running with DjinnJS in **less than 5 minutes**. Before continuning make sure [Node.js](https://nodejs.org/en/) is installed on your machine.

### 1. Install DjinnJS

For additional information refer to the [installation guide](/guides/installation).

### 2. Configure DjinnJS

If your project requires different settings than the [default configuration](/guides/configuration) settings create a custom configuraiton file.

### 3. Prepare the HTML Document

The `<main>` element is required for [Pjax](/core/pjax). Any content that will be swapped as the page transitions will need to be within the `<main>` element.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        <main></main>
    </body>
</html>
```

### 4. Load CSS Files

Tell DjinnJS what and when to load CSS files using the `eager-css` and `lazy-css` attributes. The attributes can be used on any element within the documents body. [Learn more about requesting CSS](/core/requesting-css).

```html
<main eager-css="normalize layout buttons headings">
    <div lazy-css="content"></div>
</main>
```

### 5. Create Web Components

Tell DjinnJS that a [Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html) can be upgraded into [Web Components](https://www.webcomponents.org/introduction) by adding the `web-component` attribute. [Lean more about Web Components](/core/web-components).

```html
<custom-element lazy-css="custom-element" web-component>
    ...snip...
</custom-element>
```

#### Next Steps

-   [Learn about the messaging system](/core/messaging)
-   [Learn about progressivg enhancements](/core/progressivg-enhancements)
-   [Learn about importing NPM packages](/guides/adding-npm-packages)
-   [Learn about utilizing UI Frameworks](/guides/frameworks)
