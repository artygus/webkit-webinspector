# webkit-webinspector
Standalone Webkit WebInspector frontend extracted from Webkit [sources](http://trac.webkit.org/browser/trunk/Source/WebInspectorUI). I use it as part of my project [devtools-compat-proxy](https://github.com/artygus/devtools-compat-proxy), a tool intended to provide compatibility between devtools protocols.


## Usage
To debug iOS devices you need to have [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy) installed and running.

To start static server, run

    ./server.js
    
or

    node server.js

By default server will start on 8080, you can change server port providing the command-line argument, e.g. `./server.js 8000`. Press CTRL+C to quit.

You can switch between versions using `vX` argument, allowed values are v7, v8, latest (default value).

    ./server v7

Now just navigate to `http://localhost:8080/Main.html?ws=localhost:9222/devtools/page/1`. `ws=...` part can be taken from `http://localhost:9222`, "frontend" page of ios-webkit-debug-proxy tool.

To debug older iOS devices with the latest inspector you may need to link another InspectorBackendCommands.js file, e.g.

    ln -f lib/WebInspectorUI/latest/Protocol/Legacy/8.0/InspectorBackendCommands.js lib/WebInspectorUI/latest/Protocol/

but I recommend switching to older version.

## Update

Clone WebInspectorUI to temp dir

```bash
rm -rf tmp/
git clone https://github.com/WebKit/WebKit.git --depth 1 tmp/webkit
```

Copy WebInspectorUI to serve dir

```bash
cp -R tmp/webkit/Source/WebInspectorUI/UserInterface lib/WebInspectorUI/latest
```

Link inspector latest commands file

```bash
cp lib/WebInspectorUI/latest/Protocol/Legacy/iOS/15.4/InspectorBackendCommands.js lib/WebInspectorUI/latest/Protocol/InspectorBackendCommands.js
```
