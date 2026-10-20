```javascript
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";
const filePath = path.join(__dirname, "file.hta");

app.get("/", (req, res) => {
  res.download(filePath, "file.hta", (err) => {
    if (err) {
      console.error("Download error:", err.message);

      if (!res.headersSent) {
        res.status(404).send("File not found or inaccessible.");
      }
    }
  });
});

app.get("/check", (req, res) => {
  res.download(filePath, "file.hta", (err) => {
    if (err) {
      console.error("Download error:", err.message);

      if (!res.headersSent) {
        res.status(404).send("File not found or inaccessible.");
      }
    }
  });
});

app.get("/download", (req, res) => {
  res.download(filePath, "file.hta", (err) => {
    if (err) {
      console.error("Download error:", err.message);

      if (!res.headersSent) {
        res.status(404).send("File not found or inaccessible.");
      }
    }
  });
});

app.get("/health", (req, res) => {
  const fileExists = fs.existsSync(filePath);

  res.status(fileExists ? 200 : 503).json({
    status: fileExists ? "ok" : "error",
    service: "hta-download-server",
    fileExists,
    port: PORT
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Express server running on ${HOST}:${PORT}`);
});
```
