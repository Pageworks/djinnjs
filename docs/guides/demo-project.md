# Sample Project

This section will explain how to set up a static website using [SASS](https://sass-lang.com/) and [TypeScript](https://www.typescriptlang.org/). The site will be served using [serve](https://www.npmjs.com/package/serve), if you need Apache or NGINX you will need to modify and ingore parts of this demo.

Create the `package.json` file

```json
{
    "scripts": {
        "build": "tsc && node ./scss.config.js && djinnjs && rm -rf ./_compiled",
        "preview": "serve -d ./public"
    },
    "devDependencies": {
        "glob": "^7.1.6",
        "node-sass": "^4.13.0",
        "serve": "^11.3.0",
        "typescript": "^3.7.4"
    }
}
```

Install npm packages

```bash
npm i
```

Create the `tsconfig.json` file

```json
{
	"compilerOptions": {
		"outDir": "_compiled/js",
		"allowJs": true,
		"checkJs": true,
		"target": "ES2019",
		"module": "ESNext",
		"lib": ["DOM", "ES2019"],
		"moduleResolution": "Node"
	},
	"include": ["src"],
	"exclude": ["node_modules"]
}
```

Create the `.gitignore` file

```bash
# Junk
# -------
node_modules
_compiled
.DS_Store

# Automated Files
# -------
public/assets
public/service-worker.js
public/resources-cachebust.json
```

Create `sass.config.js`

```javascript
const sass = require('node-sass');
const glob = require('glob');
const fs = require('fs');

const sourceDir = 'src';

class SassCompiler {
	constructor() {
		this.run();
	}

	async run() {
		try {
			await this.preflight();
			const files = await this.getFiles();
			await this.compile(files);
		} catch (error) {
			console.log(error);
		}
	}

	preflight() {
		return new Promise(resolve => {
			if (!fs.existsSync('_compiled')) {
				fs.mkdirSync('_compiled');
			}
			if (!fs.existsSync('_compiled/css')) {
				fs.mkdirSync('_compiled/css');
			}
			resolve();
		});
	}

	getFiles() {
		return new Promise((resolve, reject) => {
			glob(`${sourceDir}/**/*.scss`, (error, files) => {
				if (error) {
					reject(error);
				}

				resolve(files);
			});
		});
	}

	compile(files) {
		return new Promise((resolve, reject) => {
			let count = 0;
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				sass.render(
					{
						file: file,
						outputStyle: 'compressed',
					},
					(error, result) => {
						if (error) {
							reject(`${error.message} at line ${error.line} ${error.file}`);
						} else {
							let fileName = result.stats.entry.replace(/.*\//g, '').toLowerCase();
							fileName = fileName.replace(/(.scss)|(.sass)/g, '').trim();
							if (fileName) {
								const newFile = `_compiled/css/${fileName}.css`;
								fs.writeFile(newFile, result.css.toString(), error => {
									if (error) {
										reject('Something went wrong saving the file' + error);
									}

									count++;
									if (count === files.length) {
										resolve();
									}
								});
							} else {
								reject('Something went wrong with the file name of ' + result.stats.entry);
							}
						}
					}
				);
			}
		});
	}
}
new SassCompiler();
```

Create `djinnjs.config.js`

```javascript
module.exports = {
    src: './_compiled'
}
```

Create the public directory

```bash
mkdir ./public
```

Create an `index.html` file

```html
<!DOCTYPE html>
<html lang="en" state="hard-loading">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title>Demo Website</title>
    <meta name="description" content="This website was created using the DjinnJS quick start guide.">

</head>
<body>
    <!-- Loading animation elements -->
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
    <soft-loading>
        <transition-bar-one></transition-bar-one>
        <transition-bar-two></transition-bar-two>
    </soft-loading>
    <page-transition>
        <page-transition-bar></page-transition-bar>
    </page-transition>

    <!-- Content -->
    <main>
    </main>

    <!-- Noscript message -->
    <noscript>
        <p id="noscript-message">Parts of this website require JavaScript. Please re-enable JavaScript and reload the page. We apologize for the inconvenience.</p>
    </noscript>
</body>
</html>
```

Add critical css color variables

```html
<!-- Critical colors -->
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
```

Add hard loading animation CSS

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

Add noscript CSS

```html
<!-- noscript CSS -->
<noscript>
    <style>	
        page-loading {
            display: none;
        }
        img {
            opacity: 1 !important;
        }
        #noscript-message {
            position: fixed;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 1rem 1rem;
            background-color: var(--background);
            box-shadow: 0 -2px 16px rgba(51,51,51,0.1), -6px 32px rgba(51,51,51,0.1);
            border-radius: 0.25rem 0.25rem 0 0;
            text-align: center;
            z-index: 2000;
        }
    </style>
    <link rel="stylesheet" href="/assets/noscript.css">
</noscript>
```

(Optional) Add reset CSS

```html
<!-- Reset CSS -->
<style>
    * {
        position: relative;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-size: inherit;
        line-height: 1;
        font-weight: inherit;
        font-style: normal;
        text-decoration: none;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        outline: none;
        border: none;
        box-shadow: none;
        color: inherit;
    }
    html {
        height: 100vh;
        overflow-y: auto;
        width: 100vw;
        display: block;
    }
    body {
        margin: 0;
        padding: 0;
        background-color: var(--background);
        color: var(--font);
        display: block;
        min-height: 100%;
        font-size: 1rem;
        width: 100%;
        -webkit-text-size-adjust: 100%;
        font-weight: 400;
        font-family: var(--font-family);
    }
    ul li,
    ol li
    {
        line-height: 1.618;
        list-style-position: inside;
    }
    
    button
    {
        cursor: pointer;
        background: transparent;
        outline: none;
        border: none;
        user-select: none;
    }
</style>
```

Add web components polyfill if you need to support MS Edge

```html
<!-- Web Components Polyfill -->
<script>
    if (typeof CustomElementRegistry === 'undefined') {
        document.write('<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.4.0/webcomponents-bundle.js"><\/script>');
    }
</script>
```

(Optional) Add Google Anallytics script

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

Add runtime scripts

```html
<link rel="preload" href="/assets/env.mjs" as="script" crossorigin="anonymous">
<link rel="preload" href="/assets/broadcaster.mjs" as="script" crossorigin="anonymous">
<script type="module" src="/assets/runtime.mjs"></script>
```

Create the source code directory

```bash
mkdir ./src
```

Create `colors.scss` in `src/`

```scss
:root {
    --font: #1A1A1A;
    --background: #fff;

    --font-family: system-ui, BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

    @media (prefers-color-scheme: dark) {
        --font: #fff;
        --background: #1A1A1A;
    }
}
```

Create `soft-loading.scss`

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

Create `page-transition.scss`

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

Add the CSS file request attribute to the `<main>` element

```html
<main eager-load-css="colors soft-loading page-transition snackbar">
```

Add a temporary TypeScript file to prevent TypeScript compiler errors

```javascript
console.log('This is a temp file preventing TSC errors');
```

Run the build command

```bash
npm run build
```

To view the site run the preview command

```bash
npm run preview
```