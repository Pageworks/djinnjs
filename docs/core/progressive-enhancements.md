# Progressive Enhancements

Use progressive enhancements to keep your project fast and responsive on low-end devices and slow connections. All progressive enhancement checks are provided by the Env class.

## Network Connections

`env.connection` will return `'4g' | '3g' | '2g' | 'slow-2g'` based on the users network connection. Due to limited [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) support `4g` is the default on most browsers.

## Data Saver Mode

`dataSaver` will return true when the user has data saver mode enabled on their device.

```javascript
import { dataSaver } from 'djinnjs/env';

if (!dataSaver) {
	// Do or fetch something
}
```

## Memory

`env.memory` will return the approximate amount of device memory in gigabytes. Due to limited [Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory) support 4 is the default value.

## CPU

`env.cpu` will return a number indicating the number of logical processor cores. [See here](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency) for additional API information.

## Example

Below is an example of how to use progressive enhancements.

```javascript
import { env, dataSaver } from 'djinnjs/env';

class CustomVideoElement extends HTMLElement
{
    loadVideo()
    {
        // Generate and append iframe element
    }
    handleButtonClickEvent = this.loadVideo.bind(this);
        
    connectedCallback()
    {
        if (env.connection === '4g' && !dataSaver) {
			this.loadVideo();
		}

		this.addEventListener('click', this.handleButtonClickEvent);
    }
}
customElements.defind('custo-video-element', CustomVideoElement);
```