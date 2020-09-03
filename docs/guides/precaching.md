# Precaching Content and Resources

If you need to precache content or resources provide an endpoint to the `precacheURL` config value. Your endpoint should respond the following:

```json
{
    "resources": ["/path/to/resource.js"],
    "content": ["/path/to/content"]
}
```

When using the `resources-only` service worker only the `resources` array is required.
