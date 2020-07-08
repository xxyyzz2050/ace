// ==UserScript==
// @name ts-all
// @version 1.0.0
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
// @downloadURL https://gist.github.com/eng-dibo/7688b9728df393ab0b29399d3997ffe5/raw/hk.user.js
// @updateURL https://gist.github.com/eng-dibo/7688b9728df393ab0b29399d3997ffe5/raw/hk.user.js
// @inject-into auto
// ==/UserScript==

//test all `Ace Script` functions
//http://acescript.acestream.me/api/

GM_setValue("test", "ok");
console.log({ GM_info });

var tab = GM_openInTab("https://google.com?x=ok");
console.log({ tab });
tab.onclose = function() {
  console.log("tab closed");
};

GM_registerMenuCommand("ts", function() {
  console.log("cmd: ts");
});

var aj = GM_xmlhttpRequest({
  url: "https://httpbin.org/get"
});

aj.onload = function(res) {
  console.log("aj.onload", res);
};
aj.onloadend = function() {
  console.log("aj.onloadend", res);
};
aj.onprogress = function() {
  console.log("aj.onprogress", res);
};
aj.onreadystatechange = function() {
  console.log("aj.onreadystatechange", res);
};

GM_download({
  url:
    "https://gist.github.com/eng-dibo/7688b9728df393ab0b29399d3997ffe5/raw/hk.user.js",
  name: "ts-hk-download",
  onload: function() {
    console.log("downloading onload ...");
  },
  onprogress: function() {
    console.log("downloading onprogress ...");
  }
});
