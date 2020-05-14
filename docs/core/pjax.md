# Pjax

Pjax is a term used when referring to the hijacking of traditional page navigation within a project where only one HTTP request used to load the initial page. The future page requests are loaded using AJAX and the content of the page is dynamically swapped.

In DjinnJS Pjax is built into the core system as part of the Service Worker and offline-first content strategy. Pages are prefetched and stored in the offline cache when the user has a 4g connection and they're not using data-saver mode.

Pjax also provides the ability to perform page transitions. By default, the fade page transition is used.

Pjax will hijack the `click` event of all HTML Anchor Element within the DOM.

## Preventing Pjax

When Pjax shouldn't hijack a link use one of the following methods:

1. Give the element a `no-pjax` class
1. Give the element a `target` attribute
1. Give the element a `no-pjax` attribute

```html
<a href="https://example.com/" target="_blank" no-pjax class="no-pjax">Click Here</a>
```

## Dynamic Transitions

The element can control what page transition is used via a `pjax-transition` attribute. By default the configured `defaultTransition` is used for all page transitions, developers can add custom page transitions via the config file, [see configuration](/configuration#transitions) for more information.

The element that triggered the navigation can also control the animation using HTML attributes. For example the fade transition can prevent scrolling using the `scroll="none"` attribute.

```html
<a href="https://example.com/" pjax-transition="fade" scroll="none">Click Here</a>
```

## Hotswapping Views

By default Pjax swaps the documents [main element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main). Sometimes a view within the `<main>` needs to be swapped instead, when this happens tag the view with the `pjax-id` attribute and the anchor element with a `pjax-view-id` attribute. The links `pjax-view-id` value will be used to swap out the innerHTML for the elements with matching `pjax-id` attributes.

```html
<div pjax-id="blog-articles">
    ...snip...
</div>
<a href="https://example.com/blog?category=example" pjax-transition="fade" scroll="none" pjax-view-id="blog-articles">Example Category</a>
```

## Manual Navigation

Pjax can be told to change pages via [Messaging System](/messaging).

```javascript
import { broadcaster } from 'djinnjs/broadcaster';

broadcaster.message('pjax', {
    type: 'load',
    url: 'https://example.com/'
});
```

## Inline Script Elements

When Pjax loads a page any `<script>` element within the new page will be reloacted and remounted to the documents head. By default scripts will be remounted everytime they appear on a new page. This functionality is ideal when using UI Frameworks such as [Preact](https://preactjs.com/) alongside DjinnJS, however, sometimes scripts should only be loaded once. To prevent a script from being removed and remounted add the `pjax-prevent-remount` attribute to the script element. 