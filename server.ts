import express from 'express';
import path from 'path';
import fs from 'fs';
import { aiRouter } from './server/routes/ai.js';

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Safe CORS handling for local dev, preview, and Vercel domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Health check endpoint for Cloud Run and Vercel verification
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StyleWise AI Mall API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Mount AI routes under /api
app.use('/api', aiRouter);

// Standalone execution for Cloud Run and Local Dev (Skipped when running as Vercel Serverless Function)
if (process.env.VERCEL !== '1') {
  async function startServer() {
    const isProd = process.env.NODE_ENV === 'production';
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    // If running in production and dist/index.html exists, serve compiled static assets.
    // In dev mode OR if dist is not yet built, mount Vite middlewares live so the app ALWAYS loads seamlessly!
    if (isProd && fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(indexPath);
      });
    } else {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StyleWise AI server running on port ${PORT}`);
    });
  }

  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
