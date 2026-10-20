
"use strict";

const express = require("express");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
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

// Vérification de santé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: SERVICE_NAME,
    uptimeSeconds: Math.floor(process.uptime()),
    port: PORT
  });
});

// Vérification de disponibilité
app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready"
  });
});

// Page d'accueil
app.get("/", (req, res) => {
  res.status(200).json({
    service: SERVICE_NAME,
    status: "online",
    health: "/health",
    readiness: "/ready"
  });
});

// Routes inconnues
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

  res.status(500).json({
    error: "Internal server error"
  });
});

// Démarrage
const server = app.listen(PORT, HOST, () => {
  console.log(
    `Service ${SERVICE_NAME} listening on ${HOST}:${PORT}`
  );
});

// Arrêt propre
function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  server.close((err) => {
    if (err) {
      console.error("Shutdown error:", err.message);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
