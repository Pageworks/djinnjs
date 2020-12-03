# Quick Start Guide

Get up and running with DjinnJS in **less than 5 minutes**. Before continuning make sure [Node.js](https://nodejs.org/en/) is installed on your machine.

### 1. Install DjinnJS

For additional information refer to the [installation guide](/guides/installation).

### 2. Configure DjinnJS

If your project requires different settings than the [default configuration](/guides/configuration) settings create a custom configuraiton file.

### 3. Prepare the HTML Document

The `<main>` element is required for [Pjax](https://pjax.djinnjs.com/). Any content that will be swapped as the page transitions will need to be within the `<main>` element.

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

Tell DjinnJS what CSS files need to be lazy loaded using the `css` attribute. The attribute can be used on any element within the document element. [Learn more about requesting CSS](/core/requesting-css). **NOTE:** for optimal performance critical CSS should be loaded using `<link>` elements OR injected directly into the documents `<head>` using `<style>` elements.

```html
<head>
    <link href="./assets/normalize.css" rel="stylesheet" />
    <link href="./assets/layout.css" rel="stylesheet" />
    <link href="./assets/buttons.css" rel="stylesheet" />
    <link href="./assets/headings.css" rel="stylesheet" />
</head>
<main>
    <div>Above the fold content</div>
    <div css="content">Below the fold content</div>
</main>
```

### 5. Create Web Components

Tell DjinnJS that a [Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html) can be upgraded into [Web Components](https://www.webcomponents.org/introduction) by adding the `web-component` attribute. [Lean more about Web Components](/core/web-components).

```html
<custom-element web-component>
    ...snip...
</custom-element>
```

#### Next Steps

-   [Learn about progressivg enhancements](/core/progressivg-enhancements)
-   [Learn about importing NPM packages](/guides/adding-npm-packages)
-   [Learn about utilizing UI Frameworks](/guides/frameworks)
