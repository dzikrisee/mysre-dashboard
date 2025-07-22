// server.js - MySRE Dashboard Production Server
// Simpan file ini di ROOT project (sejajar dengan package.json)

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Environment variables
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('🚀 Starting MySRE Dashboard Server...');

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`
┌─────────────────────────────────────────────────────┐
│                 MySRE DASHBOARD                     │
│                  Ready! 🚀                         │
├─────────────────────────────────────────────────────┤
│  Local:    http://${hostname}:${port}               │
│  Network:  http://0.0.0.0:${port}                   │
├─────────────────────────────────────────────────────┤
│  Environment: ${dev ? 'DEVELOPMENT' : 'PRODUCTION'} │
│  Started at:  ${new Date().toLocaleString('id-ID')} │
└─────────────────────────────────────────────────────┘
      `);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
