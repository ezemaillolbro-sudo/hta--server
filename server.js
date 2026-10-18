
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";
const FILE_PATH = path.join(__dirname, "file.hta");

app.disable("x-powered-by");

// Vérifier l'état du serveur et la présence du fichier
app.get("/health", (req, res) => {
  const fileExists = fs.existsSync(FILE_PATH);

  res.set("Cache-Control", "no-store");

  res.status(fileExists ? 200 : 503).json({
    status: fileExists ? "ok" : "error",
    service: "hta-download-server",
    uptimeSeconds: Math.floor(process.uptime()),
    fileExists,
    port: PORT
  });
});

// Vérifier que le serveur est prêt
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

// Télécharger le fichier
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

// Routes existantes
app.get("/", downloadFile);
app.get("/check", downloadFile);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error"
  });
});

// Démarrer le serveur
const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

// Arrêt propre
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
