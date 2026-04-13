import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { SupabaseAdminClient } from '@/auth/supabase.client';
import { UserRoles } from './enums/user-roles.enum';
import { UserStatuses } from './enums/user-statuses.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: { companies: true },
    });
  }

  async findUserInvitations(email: string) {
    const normalized = email.trim().toLowerCase();
    const list = await this.prisma.invitations.findMany({
      where: {
        email: { equals: normalized, mode: 'insensitive' },
      },
    });
    return list.map((row) => bigintToString(row));
  }

  async acceptInvitation(invitationId: string, currentUser: AuthContextUser) {
    const invitation = await this.prisma.invitations.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) {
      throw new Error('Invitation not found.');
    }
    const invitedEmail = invitation.email?.trim().toLowerCase();
    const userEmail = (currentUser.authUser.email as string)?.trim().toLowerCase();
    if (!invitedEmail || !userEmail || invitedEmail !== userEmail) {
      throw new Error('This invitation was sent to a different email address.');
    }
    const now = new Date();
    const user = await this.prisma.users.upsert({
      where: { auth_user_id: currentUser.authUserId },
      update: {
        company_id: invitation.company_id,
        updated_at: now,
      },
      create: {
        auth_user_id: currentUser.authUserId,
        email: userEmail,
        company_id: invitation.company_id,
        role: UserRoles.USER,
        status: UserStatuses.ACTIVE,
        created_at: now,
        updated_at: now,
      },
      include: { companies: true },
    });
    await this.prisma.invitations.delete({
      where: { id: invitationId },
    });
    const appMetadata = (currentUser.authUser as { app_metadata?: Record<string, unknown> })?.app_metadata;
    const { error } = await this.supabaseAdmin.client.auth.admin.updateUserById(
      currentUser.authUserId,
      {
        app_metadata: {
          ...(appMetadata && typeof appMetadata === 'object' ? appMetadata : {}),
          companyId: invitation.company_id.toString(),
          role: 'member',
        },
      },
    );
    if (error) {
      throw new Error(`Failed to update auth: ${error.message}`);
    }
    const { companies, ...userRest } = user;
    return {
      ...bigintToString(userRest),
      company: companies ? bigintToString(companies) : null,
    };
  }

  async declineInvitation(invitationId: string, currentUser: AuthContextUser): Promise<boolean> {
    const invitation = await this.prisma.invitations.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) {
      throw new Error('Invitation not found.');
    }
    const invitedEmail = invitation.email?.trim().toLowerCase();
    const userEmail = (currentUser.authUser.email as string)?.trim().toLowerCase();
    if (!invitedEmail || !userEmail || invitedEmail !== userEmail) {
      throw new Error('This invitation was sent to a different email address.');
    }
    await this.prisma.invitations.delete({
      where: { id: invitationId },
    });
    return true;
  }
}
