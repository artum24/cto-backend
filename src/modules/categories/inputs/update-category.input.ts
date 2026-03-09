import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;
}
