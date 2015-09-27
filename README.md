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

The final stage is to make everything work. There's a very high probabilty that inspector won't start without extra work, for many reasons. So just open the console to find out the reasons of failure and patch compiled sources.  
  
\*Pay attention to the `babel` output, you might need to tweak WebInspectorUI code a bit.
