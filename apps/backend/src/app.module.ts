import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { FilesModule } from './files/files.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos y ORM
    PrismaModule,

    // Módulos de negocio
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    FilesModule,
    EmailModule,
    AuthModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
