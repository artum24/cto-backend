/**
 * Vercel serverless entry point.
 * tsconfig-paths resolves @/ aliases at runtime from dist/.
 */
const path = require('path');

// Register @/ -> dist/ path mapping so Node can resolve aliases in compiled output
require('tsconfig-paths').register({
  baseUrl: path.join(__dirname, '..'),
  paths: { '@/*': ['dist/*'] },
});

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureHttpApp } = require('../dist/configure-http-app');

let app;

async function bootstrap() {
  app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  configureHttpApp(app);
  await app.init();
}

const bootstrapPromise = bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err.message);
  process.exit(1);
});

module.exports = async (req, res) => {
  await bootstrapPromise;
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
