import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
