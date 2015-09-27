# webkit-webinspector
Standalone Webkit WebInspector frontend extracted from Webkit [sources](http://trac.webkit.org/browser/trunk/Source/WebInspectorUI). I use it as part of my project [devtools-compat-proxy](https://github.com/artygus/devtools-compat-proxy), a tool intended to provide compatibility between devtools protocols.


## Usage
To debug iOS devices you need to have [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy) installed and running.

To start static server, run

    ./server.js
    
or

    node server.js

By default server will start on 8080, you can change server port providing the command-line argument, e.g. `./server.js 8000`. Press CTRL+C to quit.

Now just navigate to `http://localhost:8080/Main.html?ws=localhost:9222/devtools/page/1`. `ws=...` part can be taken from `http://localhost:9222`, "frontend" page of ios-webkit-debug-proxy tool.

To debug older iOS devices link the correct InspectorBackendCommands.js file, e.g.

    ln -f lib/WebInspectorUI/Protocol/Legacy/8.0/InspectorBackendCommands.js lib/WebInspectorUI/Protocol/


## Update
For compilation [babel](https://github.com/babel/babel) transpiler is required, just run

    npm install
Checkout WebInspectorUI to temp dir

    svn checkout https://svn.webkit.org/repository/webkit/trunk/Source/WebInspectorUI/UserInterface tmp/WebInspectorUI
    rm -rf tmp/**/.svn
Clean old stuff

    rm -rf lib/WebInspectorUI
    cp -R tmp/WebInspectorUI lib/WebInspectorUI
Compile*

    cd tmp/WebInspectorUI
    find . -name '*.js' -not -path './External/*' -print0 | xargs -0 -I file -P 8 ../../node_modules/.bin/babel --blacklist useStrict file -o ../../lib/WebInspectorUI/file

Link InspectorBackendCommands.js file

    ln lib/WebInspectorUI/Protocol/Legacy/9.0/InspectorBackendCommands.js lib/WebInspectorUI/Protocol/

The final stage is to make everything work. There's a very high chance inspector won't start without extra work, for many reasons. So just open the console to find out the reasons of failure and patch compiled sources.  
  
\*Pay attention to the `babel` output, you might need to tweak WebInspectorUI code a bit.
