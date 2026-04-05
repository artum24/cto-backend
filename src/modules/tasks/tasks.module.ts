import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule],
  providers: [TasksResolver, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
