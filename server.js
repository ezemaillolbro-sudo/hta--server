
const express = require("express");
const path = require("path");

const app = express();

// Vérifier que le serveur fonctionne
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "hta-download-server",
    uptimeSeconds: Math.floor(process.uptime()),
    fileExists: require("fs").existsSync(
      path.join(__dirname, "file.hta")
    )
  });
});

// Télécharger file.hta depuis la page principale
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "file.hta");
  res.download(filePath);
});

// Télécharger file.hta via /check
app.get("/check", (req, res) => {
  const filePath = path.join(__dirname, "file.hta");

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);

      if (!res.headersSent) {
        res.status(404).send("File not found.");
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
