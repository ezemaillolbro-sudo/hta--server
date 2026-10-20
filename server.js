
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

const HTML_PATH = path.join(__dirname, "index.html");
const HTA_PATH = path.join(__dirname, "file.hta");

// Page d'accueil
app.get("/", (req, res) => {
  if (!fs.existsSync(HTML_PATH)) {
    return res.status(404).send("index.html introuvable.");
  }

  res.sendFile(HTML_PATH);
});

// Téléchargement manuel de file.hta
app.get("/download", (req, res) => {
  if (!fs.existsSync(HTA_PATH)) {
    return res.status(404).send("file.hta introuvable.");
  }

  res.download(HTA_PATH, "file.hta", (err) => {
    if (err && !res.headersSent) {
      res.status(500).send("Impossible de télécharger le fichier.");
    }
  });
});

// État du serveur
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hta-download-server",
    htmlExists: fs.existsSync(HTML_PATH),
    fileExists: fs.existsSync(HTA_PATH),
    port: PORT
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
