# Hard Loading

The hard loading animation is used to hide the page while critical CSS is loading. It is used by the Runtime class to inform the user what stage the loading process is in along with how many resources have finished loading. The hard loading animation should not by manually triggered.

DjinnJS does not require any specific HTML or CSS in order to run. It's recommended you use the [example below](/loading/hard#example-animation) or you create your own loading animaiton.

## Custom Animation

Animations are controlled by the Env class and the documents `state` attribute. The hard loading animation should play whenever the `state` is set to `hard-loading`

```scss
page-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="hard-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```

The file counter can be displayed by adding a `<djinnjs-file-loading-value>` element and state messages are available through a `<djinnjs-file-loading-message>` element.

The `<djinnjs-file-loading-value>` element has a `state` attribute that is set to `enabled` when the Runtime class beings loading eager CSS files. The value is displayed in the X/Y format by default but can be switched to use the X% format by setting the `usePercentage` setting to `true` within the config file.

The `<djinnjs-file-loading-message>` element has a `state` attribute that will be set to the numbers 1-3 as it updates. The states are as follows:

1. "Loading page"
2. "Collecting resources"
3. "Loading resouces:"

The messages can not be configured, however, you can use the `state` attribute with the CSS to control the element or sibling elements.

## Example Animation

The example below is used in the [Demo Project](/guides/demo-project) and on this website.

```html
<page-loading>
    <div>
        <djinnjs-file-loading-message>Loading page</djinnjs-file-loading-message>
        <djinnjs-file-loading-value></djinnjs-file-loading-value>
        <page-loading-bar>
            <bar-one></bar-one>
            <bar-two></bar-two>
        </page-loading-bar>
    </div>
</page-loading>
```

Since the hard loading animation is the first visible element the CSS should be written in the `<head>`

```html
<style>
    page-loading {
        width: 100vw;
        height: 100vh;
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        justify-content: center;
        align-items: center;
        flex-flow: column wrap;
        background-color: var(--loading-background);
        font-size: 1.25rem;
        z-index: 1000000;
        user-select: none;
        pointer-events: none;
        cursor: wait;
        text-align: center;
        visibility: hidden;
        opacity: 0;
        transition: all 150ms 150ms ease;
    }
    html[state="hard-loading"] page-loading {
        visibility: visible;
        opacity: 1;
    }

    page-loading djinnjs-file-loading-message,
    page-loading djinnjs-file-loading-value {
        line-height: 1.618;
        display: inline-block;
        font-size: 1.125rem;
        font-weight: 400;
        font-family: system-ui, BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        white-space: nowrap;
        opacity: 0.87;
        color: var(--loading-font);
    }
    page-loading page-loading-bar {
        width: 200px;
        margin-top: 0.5rem;
        height: 2px;
        position: relative;
        background-color: var(--loading-bar-background);
        overflow: hidden;
        display: block;
        box-shadow: inset 0 0 2px rgba(51,51,51,0.15);
    }
    page-loading page-loading-bar bar-one {
        left: -145%;
        position: absolute;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        animation: primaryBar 2s infinite linear;
    }
    page-loading page-loading-bar bar-one::before {
        content: "";
        background-color: var(--loading-bar);
        display: inline-block;
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        height: 100%;
        animation: primaryScale 2s infinite linear;
    }
    page-loading page-loading-bar bar-two {
        left: -100%;
        position: absolute;
        width: 100%;
        box-sizing: border-box;
        height: 100%;
        animation: secondaryBar 2s infinite linear;
    }
    page-loading page-loading-bar bar-two::before {
        content: "";
        background-color: var(--loading-bar);
        display: inline-block;
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        height: 100%;
        animation: secondaryScale 2s infinite linear;
    }
    page-loading resource-counter,
    page-loading resource-total {
        display: inline-block;
    }
    page-loading span.-slash {
        font-size:0.75rem;
        display:inline-block;
        margin:0 0.25rem;
        transform:translateY(-2px);
    }
    @keyframes primaryBar {
        0% {
            transform: translateX(0);
        }
        20% {
            transform: translateX(0);
            animation-timing-function: cubic-bezier(.5,0,.70173,.49582);
        }
        59% {
            transform: translateX(83.67142%);
            animation-timing-function: cubic-bezier(.30244,.38135,.55,.95635);
        }
        100% {
            transform: translateX(200.61106%);
        }
    }
    @keyframes secondaryBar {
        0% {
            transform: translateX(0);
            animation-timing-function: cubic-bezier(.15,0,.51506,.40969);
        }
        25% {
            animation-timing-function: cubic-bezier(.31033,.28406,.8,.73371);
            transform: translateX(37.65191%);
        }
        48.35% {
            animation-timing-function: cubic-bezier(.4,.62704,.6,.90203);
            transform: translateX(84.38617%);
        }
        100% {
            transform: translateX(160.27778%);
        }
    }
    @keyframes primaryScale {
        0% {
            transform: scaleX(.08);
        }
        36% {
            animation-timing-function: cubic-bezier(.33473,.12482,.78584,1);
            transform: scaleX(.08);
        }
        69% {
            animation-timing-function: cubic-bezier(.06,.11,.6,1);
            transform: scaleX(.66148);
        }
        100% {
            transform: scaleX(.08);
        }
    }
    @keyframes secondaryScale {
        0% {
            animation-timing-function: cubic-bezier(.20503,.05705,.57661,.45397);
            transform: scaleX(.08);
        }
        19% {
            animation-timing-function: cubic-bezier(.15231,.19643,.64837,1.00432);
            transform: scaleX(.4571);
        }
        44% {
            animation-timing-function: cubic-bezier(.25776,-.00316,.21176,1.38179);
            transform: scaleX(.72796);
        }
        100% {
            transform: scaleX(.08);
        }
    }
</style>
```

## Configuring Colors

The colors can be configured using these CSS variables:

```html
<style>
    :root {
        font-size: 100%;
        
        --loading-bar: #8bffe2;
        --loading-bar-background: hsl(165, 100%, 93%);
        --loading-bar-shadow: rgba(139, 255, 226, 0.87);
        --loading-background: #fafafa;
        --loading-font: #1A1A1A;
    }
    @media (prefers-color-scheme: dark) {
        :root {
            --loading-bar: #8bffe2;
            --loading-bar-background: hsl(165, 25%, 15%);
            --loading-bar-shadow: rgba(139, 255, 226, 0.87);
            --loading-background: #1A1A1A;
            --loading-font: #fff;
        }
    }
</style>
<noscript>
    <style>
        page-loading {
            display: none;
        }
    </style>
</noscript>
```