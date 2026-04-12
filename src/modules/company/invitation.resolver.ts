import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Invitation } from '@/modules/company/models/invitation.model';
import { Company } from '@/modules/company/models/company.model';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';

@Resolver(() => Invitation)
export class InvitationResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => Company, { nullable: true })
  async company(
    @Parent() invitation: { company_id?: string | bigint; company?: Company },
  ): Promise<Company | null> {
    if (invitation.company != null) return invitation.company;
    if (invitation.company_id == null) return null;
    const row = await this.prisma.companies.findUnique({
      where: { id: BigInt(String(invitation.company_id)) },
    });
    return row ? (bigintToString(row) as unknown as Company) : null;
  }
}
