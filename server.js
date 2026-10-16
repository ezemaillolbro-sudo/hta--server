const express = require("express");
const app = express();

// === Middleware de masquage ngrok amélioré ===
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
});

// === Route principale avec interface légitime ===
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Microsoft Windows Update Server</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
                    color: #ffffff;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 40px;
                    max-width: 800px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .logo {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: #00ff88;
                }
                .status {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🛡️</div>
                <h1>Windows Defender Update Service</h1>
                <div class="status">
                    <h2>✓ Server Connection Verified</h2>
                    <p>Secure connection established with Microsoft Update Servers</p>
                </div>
                <p>This endpoint is part of the Windows Defender automatic update system.</p>
                <p>All connections are encrypted and verified through Microsoft's security protocols.</p>
                <div class="footer">
                    <p>© 2024 Microsoft Corporation. All rights reserved.</p>
                    <p>Windows is a registered trademark of Microsoft Corporation.</p>
                    <p>Server ID: ${Date.now().toString(36).toUpperCase()}</p>
                </div>
            </div>
            
            <!-- Script innocent pour brouiller les pistes -->
            <script>
                // Microsoft Analytics Tracking
                (function() {
                    console.log('Windows Update Analytics Loaded');
                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(function() {
                            document.querySelector('.status').style.animation = 'pulse 2s infinite';
                        }, 1000);
                    });
                })();
                
                // Style dynamique
                const style = document.createElement('style');
                style.textContent = \`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.8; }
                        100% { opacity: 1; }
                    }
                \`;
                document.head.appendChild(style);
            </script>
        </body>
        </html>
    `);
});

// === Route API masquée ===
app.get("/api/update", (req, res) => {
    res.json({
        status: "success",
        version: "10.0.19045.4046",
        message: "Windows Defender definitions are up to date",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYSTEM] Windows Update Service active on port ${PORT}`);
    console.log(`[SYSTEM] Security protocols: ENABLED`);
    console.log(`[SYSTEM] Connection masking: ACTIVE`);
});
