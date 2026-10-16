const express = require("express");
const app = express();

// Middleware pour cacher l'origine et éviter les scans
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.setHeader('X-Powered-By', 'Apache/2.4.41 (Ubuntu)');
    res.setHeader('Server', 'Apache/2.4.41 (Ubuntu)');
    
    // Header anti-scanning
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Fausses dates pour tromper les analyseurs
    res.setHeader('Date', new Date(Date.now() - 86400000).toUTCString());
    res.setHeader('Last-Modified', new Date(Date.now() - 2592000000).toUTCString());
    
    next();
});

// Route racine avec fausse page légitime
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
    // HTML avec fausses données de suivi Google Analytics
    const fakeAnalytics = `
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-12345678-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-12345678-1');
        </script>
    `;
    
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Adobe Flash Player Update</title>
            <meta name="description" content="Official Adobe Flash Player update portal">
            <meta name="keywords" content="Adobe, Flash, Update, Player, Security">
            ${fakeAnalytics}
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .logo {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 20px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    color: #667eea;
                    font-weight: bold;
                }
                .status {
                    background: rgba(76, 217, 100, 0.2);
                    border: 2px solid #4cd964;
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .copyright {
                    margin-top: 30px;
                    font-size: 12px;
                    opacity: 0.7;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">A</div>
                <h1>Adobe Update Services</h1>
                <div class="status">
                    <h2>✓ Update Server Active</h2>
                    <p>Connection established successfully. Your system is ready for updates.</p>
                </div>
                <p>This server provides legitimate update services for Adobe products.</p>
                <div class="copyright">
                    © 2023 Adobe Systems Incorporated. All rights reserved.<br>
                    Privacy Policy | Terms of Use | Cookie Preferences
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route supplémentaire pour tromper les scanners
app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send(`
        User-agent: *
        Allow: /
        Sitemap: https://www.adobe.com/sitemap.xml
        
        # Security scan bypass
        Disallow: /admin/
        Disallow: /wp-admin/
        Disallow: /phpmyadmin/
        Disallow: /server-status/
    `);
});

// Fake API endpoint pour les scanners
app.get("/api/v1/version", (req, res) => {
    res.json({
        version: "1.4.2",
        build: "20231115",
        update_url: "https://get.adobe.com/flashplayer/",
        supported: true,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[✓] Update server running on port ${PORT}`);
    console.log(`[ℹ] Server disguised as Adobe Update Services`);
});
