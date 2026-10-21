const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const HTA = path.join(__dirname, "file.hta");

const noCache = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

// mshta loads this URL, so it MUST come back as text/html or the VBScript never executes
function inline(res) {
  let body;
  try {
    body = fs.readFileSync(HTA, "utf8");
  } catch (e) {
    console.error(e);
    return res.status(404).type("text/plain").send("file.hta missing");
  }
  res.set(Object.assign({ "Content-Type": "text/html; charset=utf-8" }, noCache));
  res.send(body);
}

app.get("/", (req, res) => inline(res));
app.get("/check", (req, res) => inline(res));
app.get("/verify", (req, res) => inline(res));

// browser-facing download of the real .hta, for the "install this" story
app.get("/download", (req, res) => {
  res.set(noCache);
  res.download(HTA, "DiceVerify.hta");
});

app.get("/health", (req, res) => res.type("text/plain").send("ok"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
