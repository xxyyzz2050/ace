import express from "express";

const dev = process.env.NODE_ENV === "development";
const app = express();

app.post("/action", (res, req) => {
  console.log("server works");
});

let PORT = process.env.PORT || 4200;
app
  .listen(PORT, () => {
    console.log(`Node Express server listening on port:${PORT}`);
  })
  .on("error", error =>
    console.error("[server] express error:", { port: PORT, error })
  );
