import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: any, customerId?: string) {
    // Implementar upload a R2/S3
    return { storageKey: 'xxx', url: 'https://...' };
  }
}
