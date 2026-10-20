
"use strict";

const express = require("express");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const SERVICE_NAME = "hta-download-server";

app.disable("x-powered-by");
app.disable("etag");

// Vérification de santé
app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store");

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

// Page d'accueil HTML
app.get("/", (req, res) => {
  res.status(200).type("html").send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dice Online</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #111116;
      color: #f5f5f7;
      font-family: Arial, sans-serif;
    }

    main {
      width: 100%;
      max-width: 520px;
      padding: 36px;
      border: 1px solid #34343f;
      border-radius: 16px;
      background: #1b1b24;
      text-align: center;
    }

    h1 { margin-top: 0; }

    p { color: #b9b9c5; }

    .status {
      margin: 24px 0;
      color: #63dda0;
    }

    a { color: #a99bff; }
  </style>
</head>
<body>
  <main>
    <h1>Dice Online</h1>
    <p>Service en ligne</p>
    <div class="status">● Serveur opérationnel</div>
    <p>Le serveur répond correctement aux requêtes.</p>
    <a href="/health">Vérifier le statut du serveur</a>
  </main>
</body>
</html>`);
});

// Route inconnue
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Gestion des erreurs
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
