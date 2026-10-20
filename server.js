
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

const HTML_PATH = path.join(__dirname, "index.html");
const HTA_PATH = path.join(__dirname, "file.hta");

// Page HTML principale
app.get("/", (req, res) => {
  if (!fs.existsSync(HTML_PATH)) {
    return res.status(404).send("index.html introuvable.");
  }

  res.sendFile(HTML_PATH);
});

// Accès séparé au fichier HTA
app.get("/download", (req, res) => {
  if (!fs.existsSync(HTA_PATH)) {
    return res.status(404).send("file.hta introuvable.");
  }

  res.download(HTA_PATH);
});

// Vérification de la présence du fichier
app.get("/check", (req, res) => {
  res.json({
    htmlExists: fs.existsSync(HTML_PATH),
    htaExists: fs.existsSync(HTA_PATH)
  });
});

// Vérification de l'état du serveur
app.get("/health", (req, res) => {
  res.status(200).json({
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
