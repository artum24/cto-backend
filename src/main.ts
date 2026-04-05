import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureHttpApp } from './configure-http-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app);

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err.message);
  process.exit(1);
});
