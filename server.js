
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const FILE_PATH = path.join(__dirname, "file.hta");

// Configuration
app.disable("x-powered-by");

// Éviter de conserver en cache les réponses de diagnostic
app.get("/health", (req, res) => {
  const fileExists = fs.existsSync(FILE_PATH);

  res.set("Cache-Control", "no-store");

  res.status(fileExists ? 200 : 503).json({
    status: fileExists ? "ok" : "error",
    service: "hta-download-server",
    uptimeSeconds: Math.floor(process.uptime()),
    fileExists
  });
});

// Route de vérification de disponibilité
app.get("/ready", (req, res) => {
  if (!fs.existsSync(FILE_PATH)) {
    return res.status(503).json({
      status: "not_ready",
      message: "Required file is unavailable"
    });
  }

  res.status(200).json({
    status: "ready"
  });
});

// Téléchargement avec gestion centralisée des erreurs
function downloadFile(req, res, next) {
  fs.stat(FILE_PATH, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).json({
        error: "File not found"
      });
    }

    res.download(FILE_PATH, "file.hta", (downloadError) => {
      if (downloadError) {
        if (res.headersSent) {
          return next(downloadError);
        }

        console.error("Download error:", downloadError.message);

        return res.status(500).json({
          error: "Download failed"
        });
      }
    });
  });
}

// Conserver les routes existantes
app.get("/", downloadFile);
app.get("/check", downloadFile);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Gestion générale des erreurs Express
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error"
  });
});

// Démarrage
const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

// Arrêt propre du serveur
function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close((err) => {
    if (err) {
      console.error("Shutdown error:", err);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
