
"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

app.disable("x-powered-by");
app.disable("etag");

app.use(express.json({ limit: "10kb" }));

// En-têtes de sécurité de base
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});

// Page d'accueil
app.get("/", (req, res) => {
    res.status(200).type("html").send(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HTA Download Server</title>
</head>
<body>
  <h1>Serveur en ligne</h1>
  <p>Le serveur fonctionne correctement.</p>
  <p><a href="/health">Vérifier le statut</a></p>
  <p><a href="/download">Télécharger le fichier public</a></p>
</body>
</html>`);
});

// Vérification de santé pour Railway
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "hta-download-server",
        uptimeSeconds: Math.floor(process.uptime())
    });
});

// Téléchargement d'un fichier autorisé
app.get("/download", (req, res, next) => {
    const filePath = path.join(
        __dirname,
        "public",
        "readme.txt"
    );

    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            return res.status(404).json({
                error: "Fichier introuvable."
            });
        }

        res.download(filePath, "readme.txt", (downloadError) => {
            if (downloadError && !res.headersSent) {
                next(downloadError);
            }
        });
    });
});

// Route inexistante
app.use((req, res) => {
    res.status(404).json({
        error: "Route introuvable."
    });
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
    console.error("Erreur serveur :", err.message);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: "Erreur interne du serveur."
    });
});

// Démarrage du serveur
const server = app.listen(PORT, HOST, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Arrêt propre
let shuttingDown = false;

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("Arrêt du serveur...");

    server.close((err) => {
        if (err) {
            console.error("Erreur pendant l'arrêt :", err.message);
            process.exitCode = 1;
        }
    });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
