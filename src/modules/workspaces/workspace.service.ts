import {Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import {CreateWorkspaceInput} from "@/modules/workspaces/inputs/create-workspace.input";
import {UpdateWorkspaceInput} from "@/modules/workspaces/inputs/update-workspace.input";
import {Workspace} from "@/modules/workspaces/models/workspaces.model";

import { Prisma } from '@prisma/client';

type WorkspaceDB = Prisma.workspacesGetPayload<Record<string, never>>;

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  private toGraphQL(workspace: WorkspaceDB) : Workspace {
    return {
      ...bigintToString(workspace),
    };
  }

  async findAll(companyId: bigint) {
    const workspaces = await this.prisma.workspaces.findMany({
      where: {
        company_id: companyId,
      },
    });
    return workspaces.map((w) => this.toGraphQL(w));
  }

  async create(input: CreateWorkspaceInput, companyId: bigint) {
    const workspace = await this.prisma.workspaces.create({
      data: {
        title: input.title,
        number: input.number,
        company_id: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return this.toGraphQL(workspace);
  }

  async update(input: UpdateWorkspaceInput, companyId: bigint) {
    const existing = await this.prisma.workspaces.findFirst({
      where: { id: BigInt(input.id), company_id: companyId },
    });
    if (!existing) throw new NotFoundException('Workspace not found');
    const workspace = await this.prisma.workspaces.update({
      where: {
        id: BigInt(input.id),
      },
      data: {
        title: input.title,
        number: input.number,
        updated_at: new Date(),
      },
    });
    return this.toGraphQL(workspace);
  }

  async delete(id: bigint, companyId: bigint) {
    const existing = await this.prisma.workspaces.findFirst({
      where: { id: BigInt(id), company_id: companyId },
    });
    if (!existing) throw new NotFoundException('Workspace not found');
    const workspace = await this.prisma.workspaces.delete({
      where: {
        id: BigInt(id),
      },
    });
    return this.toGraphQL(workspace);
  }
}
