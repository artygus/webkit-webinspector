# webkit-webinspector

Standalone Webkit WebInspector frontend extracted from Webkit [sources](https://github.com/WebKit/WebKit/tree/main/Source/WebInspectorUI/UserInterface).


## Usage
To debug iOS devices you need to have [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy) installed and running.

To start WebInspectorUI run

```bash
yarn start
```

By default server will start on 8080, you can change server port providing the command-line argument, e.g. `yarn start 8000`. Press CTRL+C to quit.

Navigate to `http://localhost:8080/Main.html?ws=localhost:9222/devtools/page/1`. `ws=...` part can be taken from `http://localhost:9222`, "frontend" page of ios-webkit-debug-proxy tool.

### Command protocols

Command protocol and WebInspectorUI capabilities may vary depending on iOS version. To list all available command protocols run

```bash
yarn start -P list
```

By default the latest command protocol available in checked in WebInspectorUI is used.

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
