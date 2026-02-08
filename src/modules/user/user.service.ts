import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: { companies: true },
    });
  }
}
