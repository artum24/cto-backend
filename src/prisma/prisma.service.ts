import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg(
      new Pool({
        connectionString: process.env.DATABASE_URL,
        // Serverless: one connection per invocation; avoid exhausting DB limits
        max: process.env.VERCEL === '1' ? 1 : undefined,
      }),
    );
    // `adapter` requires `driverAdapters` preview feature — types update after `npx prisma generate`
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication): void {
    this.$on('beforeExit' as never, () => {
      void app.close();
    });
  }
}
