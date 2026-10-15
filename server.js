
"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Configuration Railway
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

app.disable("x-powered-by");

app.use(express.json({ limit: "10kb" }));

// En-têtes de sécurité
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});

// Chemin du fichier HTA situé à la racine
const filePath = path.join(__dirname, "file.hta");

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
    <p><a href="/health">Vérifier le statut du serveur</a></p>
    <p><a href="/download">Télécharger file.hta</a></p>
</body>
</html>`);
});

// Vérification de santé pour Railway
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "hta-download-server",
        uptimeSeconds: Math.floor(process.uptime()),
        fileExists: fs.existsSync(filePath)
    });
});

// Téléchargement de file.hta
app.get("/download", (req, res, next) => {
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            console.error("Fichier HTA introuvable :", filePath);

            return res.status(404).json({
                error: "Fichier file.hta introuvable.",
                expectedLocation: "Racine du dépôt"
            });
        }

        res.download(filePath, "file.hta", (downloadError) => {
            if (downloadError) {
                if (res.headersSent) {
                    return next(downloadError);
                }

                return res.status(500).json({
                    error: "Impossible de télécharger le fichier."
                });
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
    console.log(`Serveur démarré sur ${HOST}:${PORT}`);
    console.log(`Fichier HTA attendu : ${filePath}`);
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
