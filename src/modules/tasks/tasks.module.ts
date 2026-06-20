import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import {TaskPubSubProvider} from "@/modules/tasks/task-pubsub.provider";

@Module({
  imports: [PrismaModule],
  providers: [TasksResolver, TasksService, TaskPubSubProvider],
  exports: [TasksService],
})
export class TasksModule {}
