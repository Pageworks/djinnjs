# Soft Loading

The soft loading animation is used by the Env class. Whenever `env.startLoading()` is called the DOM's state is set to `soft-loading` and unlike the hard loading animation the soft loading state doesn't have states or a calculated end. It is an infinite loading animation that can be used when you're unsure how long something will take to load.

DjinnJS does not require any specific HTML or CSS in order to run. It's recommended you use the [example below](/loading/hard#example-animation) or you create your own loading animaiton.

## Custom Animation

Animations are controlled by the Env class and the documents `state` attribute. The soft loading animation should play whenever the `state` is set to `soft-loading`

```scss
infinite-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="soft-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```

## Example Animation

```html
<soft-loading>
    <transition-bar-one></transition-bar-one>
    <transition-bar-two></transition-bar-two>
</soft-loading>
```

Since the soft loading animation isn't immediately visible it can be a CSS file that is eager loaded.

#### soft-loading.scss

```scss
soft-loading {
	width: 100vw;
	height: 3px;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99999;
	transform: translate3d(0, -101%, 0);
	transition: transform 125ms cubic-bezier(0.4, 0, 0.6, 1);
	background-color: var(--loading-bar-background);
	display: inline-block;
	opacity: 0;
    user-select: none;
    visibility: hidden;
	pointer-events: none;
}

html[state='soft-loading'] * {
	cursor: wait !important;
}

html[state='soft-loading'] soft-loading {
	transform: translate3d(0, 0, 0);
    opacity: 1;
    visibility: visible;
	transition: transform 150ms cubic-bezier(0, 0, 0.2, 1);
}

html[state='soft-loading'] soft-loading transition-bar-one {
	animation: primaryBar 2s infinite linear;
}

html[state='soft-loading'] soft-loading transition-bar-one:before {
	animation: primaryScale 2s infinite linear;
}

html[state='soft-loading'] soft-loading transition-bar-two {
	animation: secondaryBar 2s infinite linear;
}

html[state='soft-loading'] soft-loading transition-bar-two:before {
	animation: secondaryScale 2s infinite linear;
}

soft-loading transition-bar-one {
	left: -145%;
	position: absolute;
	width: 100%;
	height: 100%;
}

soft-loading transition-bar-one::before {
	content: '';
	background-color: var(--loading-bar);
	box-shadow: 0 0 3px var(--loading-bar-shadow);
	display: inline-block;
	position: absolute;
	width: 100%;
	height: 100%;
}

soft-loading transition-bar-two {
	left: -54%;
	position: absolute;
	width: 100%;
	height: 100%;
}

soft-loading transition-bar-two::before {
	content: '';
	background-color: var(--loading-bar);
	box-shadow: 0 0 3px var(--loading-bar-shadow);
	display: inline-block;
	position: absolute;
	width: 100%;
	height: 100%;
}
```

It uses the same colors as the hard loading animation, [click here](/loading/hard#configuring-colors) for more information.

## Example

In this example a web component needs to load the D3 JavaScript library. The soft loading animation will displayed while the library is being fetched.

```javascript
import { fetchJS } from 'djinnjs/fetch';
import { env } from 'djinnjs/env';

class CustomComponent extends HTMLElement {
    init(){
        // Do something with d3.js
    }
    connectedCallback() {
        const ticket = env.startLoading();
        fetchJS('d3').then(() => {
            env.stopLoading(ticket);
            this.init();
        });
    }
}
```