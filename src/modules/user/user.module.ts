import { Module } from '@nestjs/common';
import { UserResolver } from '@/modules/user/user.resolver';
import { UserService } from '@/modules/user/user.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
