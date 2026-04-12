import { InputType } from '@nestjs/graphql';
import { CompanyInput } from '@/modules/company/inputs/company.input';

@InputType()
export class CompanyCreateInput extends CompanyInput {}
