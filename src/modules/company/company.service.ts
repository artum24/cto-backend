import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { bigintToString } from '../../common/mappers/bigint.mapper';
import { CompanyInput } from './inputs/company.input';
import { AuthContextUser } from '../../auth/supabase-auth.guard';
import { CompanyType } from './enums/company-type.enum';
import { SupabaseAdminClient } from '../../auth/supabase.client';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminClient,
  ) {}

  async findById(id: bigint) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) return null;
    return { ...company, id: company.id.toString() };
  }

  async findCompanyMembers(id: bigint) {
    const users = await this.prisma.users.findMany({
      where: { company_id: id },
    });
    console.log('users', users);
    const invitations = await this.prisma.invitations.findMany({
      where: { company_id: id },
    });
    return [...users.map(bigintToString), ...invitations];
  }

  async create(companyInput: CompanyInput, currentUser: AuthContextUser) {
    const companyTypeMap: Record<CompanyType, number> = {
      [CompanyType.CTO]: 1,
      [CompanyType.TIRE_SERVICE]: 2,
      [CompanyType.CAR_WASH]: 3,
    };

    const companyData = {
      ...companyInput,
      company_type: companyTypeMap[companyInput.company_type],
    };

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
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
          'Кліматична система',
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
            role: 1,
            status: 1,
          },
          create: {
            auth_user_id: currentUser.authUserId,
            email: currentUser.authUser.email,
            company_id: company.id,
            role: 1,
            status: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          include: { companies: true },
        });

        const appMetadata = (
          currentUser.authUser as { app_metadata?: Record<string, any> }
        )?.app_metadata;
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
        errors: [],
      };
    } catch (e) {
      if (e instanceof Error) {
        return { errors: [e.message] };
      }
      return { errors: ['An unknown error occurred'] };
    }
  }
}
