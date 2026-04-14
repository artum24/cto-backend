import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CompanyInput } from './inputs/company.input';
import { UpdateCompanyInput } from './inputs/update-company.input';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { SupabaseAdminClient } from '@/auth/supabase.client';
import { UserRoles } from '@/modules/user/enums/user-roles.enum';
import { UserStatuses } from '@/modules/user/enums/user-statuses.enum';

/** Default warehouse categories for a new company storage (seed). */
const DEFAULT_CATEGORY_NAMES = [
  'Масла й рідини',
  'Фільтри',
  'Гальмівна система',
  'Охолодження',
  'Освітлення',
  'Ремені/ролики',
  'Акумулятори',
  'Шини/диски',
  'Трансмісія',
  'Підвіска/кермування',
  'Електрика',
  'Кузов/салон',
  'Інструмент/витратні',
  'Запалювання/свічки',
  'Система вихлопу',
  'Електроніка авто',
  'Скло/дзеркала',
  'Kліматична система',
  'Паливна система',
  'ГБО/газова система',
  'Хімія/автокосметика',
  'Кріплення/болти/гайки',
  'Аксесуари салону',
] as const;

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  private normalizeAppMetadata(value: unknown): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === 'object' && !Array.isArray(value)) {
      return { ...(value as Record<string, unknown>) };
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...(parsed as Record<string, unknown>) };
        }
      } catch {
        return {};
      }
    }
    return {};
  }

  /** Drops non-JSON-serializable fields (safe for GoTrue request bodies). */
  private toJsonSafeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
    try {
      return JSON.parse(JSON.stringify(meta)) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * After the company row exists, patch Supabase app_metadata (companyId, role).
   * Runs outside the DB transaction. Does not throw: onboarding should not fail on Auth hiccups.
   */
  private async syncSupabaseAppMetadataForNewCompany(
    authUserId: string,
    companyId: bigint,
  ): Promise<void> {
    const companyIdStr = companyId.toString();
    const minimal: Record<string, string> = {
      companyId: companyIdStr,
      role: 'admin',
    };

    const getRes =
      await this.supabaseAdmin.client.auth.admin.getUserById(authUserId);

    const fromServer = this.normalizeAppMetadata(getRes.data?.user?.app_metadata);
    const merged: Record<string, unknown> = { ...fromServer, ...minimal };
    let payload = this.toJsonSafeMetadata(merged);

    if (Object.keys(payload).length < Object.keys(minimal).length) {
      payload = { ...minimal };
    }

    let updateRes = await this.supabaseAdmin.client.auth.admin.updateUserById(
      authUserId,
      { app_metadata: payload },
    );

    if (updateRes.error) {
      updateRes = await this.supabaseAdmin.client.auth.admin.updateUserById(
        authUserId,
        { app_metadata: minimal },
      );
    }

    if (updateRes.error) {
      this.logger.warn(
        'createCompany: Supabase user metadata not updated; company is in DB. Verify SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and that authUserId is the Supabase Auth user UUID.',
      );
    }
  }

  async findById(id: bigint) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) return null;
    return { ...company, id: company.id.toString() };
  }

  async findCompanyMembers(id: bigint) {
    const [users, invitations] = await Promise.all([
      this.prisma.users.findMany({ where: { company_id: id } }),
      this.prisma.invitations.findMany({ where: { company_id: id } }),
    ]);
    return [...users.map(bigintToString), ...invitations.map(bigintToString)];
  }

  async update(companyId: bigint, input: UpdateCompanyInput) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('Company not found.');
    }
    const data: Prisma.companiesUpdateInput = {
      updated_at: new Date(),
      ...(input.title !== undefined && { title: input.title ?? null }),
      ...(input.city !== undefined && { city: input.city ?? null }),
      ...(input.city_ref !== undefined && { city_ref: input.city_ref ?? null }),
      ...(input.address !== undefined && { address: input.address ?? null }),
      ...(input.address_ref !== undefined && { address_ref: input.address_ref ?? null }),
      ...(input.house_number !== undefined && { house_number: input.house_number ?? null }),
      ...(input.company_type !== undefined && {
        company_type: input.company_type ?? null,
      }),
    };

    const updated = await this.prisma.companies.update({
      where: { id: companyId },
      data,
    });
    return bigintToString(updated);
  }

  async inviteMember(companyId: bigint, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const [existingUser, existingInvitation] = await Promise.all([
      this.prisma.users.findFirst({
        where: { email: normalizedEmail, company_id: companyId },
      }),
      this.prisma.invitations.findFirst({
        where: { company_id: companyId, email: normalizedEmail },
      }),
    ]);
    if (existingUser) {
      throw new Error('This user is already a member of your company.');
    }
    if (existingInvitation) {
      throw new Error('This email has already been invited.');
    }
    const now = new Date();
    const invitation = await this.prisma.invitations.create({
      data: {
        company_id: companyId,
        email: normalizedEmail,
        created_at: now,
        updated_at: now,
      },
    });
    return bigintToString(invitation);
  }

  async create(companyInput: CompanyInput, currentUser: AuthContextUser) {
    const email = currentUser.authUser.email?.trim().toLowerCase();
    if (!email) {
      throw new Error(
        'Authenticated user has no email; cannot create or link company profile.',
      );
    }

    const companyData = {
      title: companyInput.title,
      company_type: companyInput.companyType,
      city: companyInput.city,
      city_ref: companyInput.cityRef,
      address: companyInput.address,
      address_ref: companyInput.addressRef,
      house_number: companyInput.houseNumber,
    };

    try {
      const result = await this.prisma.$transaction(async (prisma: PrismaClient) => {
        const now = new Date();

        const company = await prisma.companies.create({
          data: { ...companyData, created_at: now, updated_at: now },
        });

        const storage = await prisma.storages.create({
          data: {
            name: company.title,
            company_id: company.id,
            created_at: now,
            updated_at: now,
          },
        });

        await prisma.categories.createMany({
          data: DEFAULT_CATEGORY_NAMES.map((name) => ({
            name,
            storage_id: storage.id,
            created_at: now,
            updated_at: now,
          })),
        });

        const user = await prisma.users.upsert({
          where: { email },
          update: {
            company_id: company.id,
            role: UserRoles.ADMIN,
            status: UserStatuses.ACTIVE,
            updated_at: now,
          },
          create: {
            auth_user_id: currentUser.authUserId,
            email,
            company_id: company.id,
            role: UserRoles.ADMIN,
            status: UserStatuses.ACTIVE,
            created_at: now,
            updated_at: now,
          },
          include: { companies: true },
        });

        return { company, user };
      });

      await this.syncSupabaseAppMetadataForNewCompany(
        currentUser.authUserId,
        result.company.id,
      );

      return {
        company: bigintToString(result.company),
        user: {
          ...bigintToString(result.user),
          company: bigintToString(result.user.companies!),
        },
      };
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error('An unknown error occurred during company creation');
    }
  }
}
