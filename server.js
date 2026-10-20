
"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const FILE_PATH = path.join(__dirname, "file.hta");
const SERVICE_NAME = "hta-download-server";

app.disable("x-powered-by");
app.disable("etag");

// En-têtes HTTP
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  });

  next();
});

// Vérifier l'état du serveur
app.get("/health", (req, res) => {
  const fileExists = fs.existsSync(FILE_PATH);

  res.status(fileExists ? 200 : 503).json({
    status: fileExists ? "ok" : "error",
    service: SERVICE_NAME,
    uptimeSeconds: Math.floor(process.uptime()),
    fileExists,
    port: PORT
  });
});

// Vérifier si le service est prêt
app.get("/ready", (req, res) => {
  fs.stat(FILE_PATH, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(503).json({
        status: "not_ready",
        message: "Required file is unavailable"
      });
    }

    return res.status(200).json({
      status: "ready"
    });
  });
});

// Télécharger le fichier
function downloadFile(req, res, next) {
  fs.stat(FILE_PATH, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).json({
        error: "File not found"
      });
    }

    res.download(FILE_PATH, "file.hta", (downloadError) => {
      if (!downloadError) return;

      if (res.headersSent) {
        return next(downloadError);
      }

      console.error("Download error:", downloadError.message);

      return res.status(500).json({
        error: "Download failed"
      });
    });
  });
}

// Routes de téléchargement
app.get("/", downloadFile);
app.get("/check", downloadFile);
app.get("/download", downloadFile);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error("Express error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: "Internal server error"
  });
});

// Démarrer le serveur
const server = app.listen(PORT, HOST, () => {
  console.log(`Service ${SERVICE_NAME} listening on ${HOST}:${PORT}`);
});

// Arrêt propre du serveur
function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  server.close((err) => {
    if (err) {
      console.error("Shutdown error:", err.message);
      process.exitCode = 1;
    }
  });

  setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
