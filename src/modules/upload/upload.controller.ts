import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const ALLOWED_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

@Controller('upload-xlsx-clients')
@UseGuards(SupabaseAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthContextUser,
  ) {
    if (!file) {
      throw new BadRequestException('File missing');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new UnprocessableEntityException('File too large');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only Excel files (.xlsx, .xls) are allowed');
    }

    if (!user.user.company_id) {
      throw new BadRequestException('User is not associated with a company');
    }

    const jobId = await this.uploadService.enqueueXlsxImport(
      file.buffer,
      BigInt(user.user.company_id),
    );

    return { jobId };
  }
}
