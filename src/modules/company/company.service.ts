import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { CompanyInput } from './inputs/company.input';
import { UpdateCompanyInput } from './inputs/update-company.input';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { SupabaseAdminClient } from '@/auth/supabase.client';
import { UserRoles } from '@/modules/user/enums/user-roles.enum';
import { UserStatuses } from '@/modules/user/enums/user-statuses.enum';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  private normalizeAppMetadata(value: unknown): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return {};
      }
    }
    return {};
  }

  async findById(id: bigint) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) return null;
    return { ...company, id: company.id.toString() };
  }

  async findCompanyMembers(id: bigint) {
    const users = await this.prisma.users.findMany({
      where: { company_id: id },
    });
    const invitations = await this.prisma.invitations.findMany({
      where: { company_id: id },
    });
    return [...users.map(bigintToString), ...invitations];
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
      // CompanyType enum values are integers (CTO=1, TIRE_SERVICE=2, CAR_WASH=3)
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
    const existingUser = await this.prisma.users.findFirst({
      where: { email: normalizedEmail, company_id: companyId },
    });
    if (existingUser) {
      throw new Error('This user is already a member of your company.');
    }
    const existingInvitation = await this.prisma.invitations.findFirst({
      where: {
        company_id: companyId,
        email: normalizedEmail,
      },
    });
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
    // CompanyType enum values are integers (CTO=1, TIRE_SERVICE=2, CAR_WASH=3)
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
        const company = await prisma.companies.create({
          data: { ...companyData, created_at: new Date(), updated_at: new Date() },
        });

        const storage = await prisma.storages.create({
          data: {
            name: company.title,
            company_id: company.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const BASE_CATEGORIES = [
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
        ];

        await prisma.categories.createMany({
          data: BASE_CATEGORIES.map((name) => ({
            name,
            storage_id: storage.id,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        });

        const user = await prisma.users.upsert({
          where: { email: currentUser.authUser.email as string },
          update: {
            company_id: company.id,
            role: UserRoles.ADMIN,
            status: UserStatuses.ACTIVE,
          },
          create: {
            auth_user_id: currentUser.authUserId,
            email: currentUser.authUser.email,
            company_id: company.id,
            role: UserRoles.ADMIN,
            status: UserStatuses.ACTIVE,
            created_at: new Date(),
            updated_at: new Date(),
          },
          include: { companies: true },
        });

        const appMetadata = this.normalizeAppMetadata(
          (currentUser.authUser as { app_metadata?: unknown })?.app_metadata,
        );
        const { error } =
          await this.supabaseAdmin.client.auth.admin.updateUserById(
            currentUser.authUserId,
            {
              app_metadata: {
                ...appMetadata,
                companyId: company.id.toString(),
                role: 'admin',
              },
            },
          );

        if (error) {
          throw new Error(`Failed to update Supabase user: ${error.message}`);
        }

        return { company, user };
      });

      return {
        company: bigintToString(result.company),
        user: {
          ...bigintToString(result.user),
          company: bigintToString(result.user.companies!),
        },
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error('An unknown error occurred during company creation');
    }
  }
}
