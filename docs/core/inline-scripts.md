# Inline Script Elements

When [Pjax](https://pjax.djinnjs.com) loads a page any `<script>` element within the new page will be relocated and remounted to the documents head. By default, scripts will be remounted every time they appear on a new page.

Sometimes scripts should only be loaded once. To prevent a script from being removed and remounted add the `pjax-prevent-remount` attribute to the script element.
