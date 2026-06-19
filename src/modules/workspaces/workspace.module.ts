import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import {WorkspacesResolver} from "@/modules/workspaces/workspaces.resolver";
import {WorkspaceService} from "@/modules/workspaces/workspace.service";

@Module({
  imports: [PrismaModule],
  providers: [WorkspacesResolver, WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
