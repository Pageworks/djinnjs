# Page Loading

The page loading animation is used by the Pjax class and cannot manually be triggered. DjinnJS does not require any specific HTML or CSS in order to run. It's recommended you use the [example below](/loading/hard#example-animation) or you create your own loading animaiton.

## Custom Animation

Animations are controlled by the Env class and the documents `state` attribute. The page loading animation should play whenever the `state` is set to `page-loading`

```scss
page-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="page-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```

The page loading animation has an additional state of `page-loading-complete` and is set once the page has successfully swapped to the new page. The complete state last 600ms before resuming the `soft-loading` or `idling` state. Ideally the completed state should be used to finish the "hanging" animation. For more information about designing for speed and hacking user perception [watch this video](https://youtu.be/0-3GBgRg9ow).

## Example Animation

```html
<page-transition>
    <page-transition-bar></page-transition-bar>
</page-transition>
```

Since the page loading animation is not visible immediately it can be a CSS file that is eager loaded:

#### page-transition.scss

```scss
page-transition {
	width: 100vw;
	height: 2px;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99999;
	display: inline-block;
	visibility: hidden;
	user-select: none;
	pointer-events: none;

	html[state="page-loading"] &,
	html[state="page-loading-complete"] & {
		visibility: visible;
	}

	page-transition-bar {
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		width: 100%;
		height: 100%;
		transform: scaleX(0);
		transform-origin: left center;
		background-color: var(--loading-bar);
		box-shadow: 0 0 3px var(--loading-bar-shadow);
		overflow: hidden;

		html[state="page-loading"] & {
			animation: startLoading 600ms ease-out forwards;
		}

		html[state="page-loading-complete"] & {
			transform: scaleX(0.33);
			animation: endLoading 600ms ease forwards;
		}

		&::after {
			content:"";
			display: inline-block;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0));
			animation: gradientLoop 2000ms infinite;
		}
	}
}

@keyframes gradientLoop
{
	from {
		transform: translateX(100%);
	}
	to {
		transform: translateX(-100%);
	}
}

@keyframes startLoading {
	from {
		transform: scaleX(0);
	}
	to {
		transform: scaleX(0.66);
	}
}

@keyframes endLoading {
	0% {
		transform: scaleX(0.66) translateX(0);
	}
	25%, 50% {
		transform: scaleX(1) translateX(0);
	}
	100% {
		transform: scaleX(1) translateX(100%);
	}
}
```

It uses the same colors as the hard loading animation, [click here](/loading/hard#configuring-colors) for more information.