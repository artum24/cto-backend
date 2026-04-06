/**
 * Vercel serverless entry. Requires `npm run build` first (outputs `dist/`).
 * Uses the underlying Express instance from Nest — no Lambda event adapter.
 */
const { NestFactory } = require('@nestjs/core');
// Vercel places `includeFiles` alongside the handler — dist/ is at ./dist/ not ../dist/
const { AppModule } = require('./dist/app.module');
const { configureHttpApp } = require('./dist/configure-http-app');

let expressApp;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  configureHttpApp(app);
  await app.init();
  expressApp = app.getHttpAdapter().getInstance();
}

module.exports = async (req, res) => {
  try {
    if (!expressApp) {
      await bootstrap();
    }
    expressApp(req, res);
  } catch (err) {
    console.error('api/index.js bootstrap failed:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};
