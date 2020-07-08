# Progressive Enhancements

Use progressive enhancements to keep your project fast and responsive on low-end devices and slow connections. Progressive enhancement checks are provided by the Env class.

## Network Connections

`env.connection` will return `'4g' | '3g' | '2g' | 'slow-2g'` based on the users network connection. Due to limited [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) support `4g` is the default on most browsers.

To check if the current connection matches the minimum you're requiring use the `checkConnection()` function.

```javascript
import { checkConnection } from "djinnjs/env";

if (checkConnection("3g")) {
    // This code will run on a 3g or 4g connection
}
```

## Data Saver Mode

`dataSaver` will return true when the user has data saver mode enabled on their device.

```javascript
import { dataSaver } from "djinnjs/env";

if (!dataSaver) {
    // Do or fetch something
}
```

## Memory

`env.memory` will return the approximate amount of device memory in gigabytes. Due to limited [Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory) support 4 is the default value.

## CPU

`env.cpu` will return the number of logical processor cores. [See here](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency) for additional API information.

## Thread Pool

`env.threadPool` will return the number of available logical processor cores currently, they will always return 0 on Safari due to browser limitations.

To update the thread pool count use the `reserveThread()` and `releaseThread()` functions.

```javascript
import { reserveThread, releaseThread } from "djinnjs/env";
reserveThread()
    .then(() => {
        // TODO: spawn web worker
    })
    .catch(() => {
        // Thread pool is empty
    });

if (webWorkerTermiated) {
    releaseThread();
}
```
