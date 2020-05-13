# Working With NPM Packages

Sometimes you'll need to work with NPM packages and 3rd party libraries. The easiest way to consume NPM packages is to use a tool like [Snowpack](https://www.snowpack.dev/). Snowpack unpacks packages as single JavaScript files in a `web_modules/` directory and configures the package to be imported using ES Modules. [Click here](https://www.snowpack.dev/#all-config-options) for additional information about configuring Snowpack.

## 3rd Party Libraries

Not all JavaScript libraries are available via NPM and not all NPM packages can be exported as ES Modules. When this happens simply include the library via the `fetchJS` function. [Click here](/learn/importing-resources) for additional information about importing resources.