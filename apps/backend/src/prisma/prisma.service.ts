import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      errorFormat: 'pretty',
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected');
      await this.seedIfEmpty();
    } catch (error) {
      console.warn('⚠️ Database connection failed, will retry on first query', error.message);
    }
  }

  private async seedIfEmpty() {
    try {
      const categoryCount = await this.category.count();
      if (categoryCount > 0) {
        return;
      }

      console.log('🌱 No categories found, seeding starter catalog...');

      const [mensaje, foto, tematicas, mixto] = await Promise.all([
        this.category.upsert({
          where: { slug: 'galletas-mensaje' },
          update: {},
          create: {
            name: 'Galletas con Mensaje',
            description: 'Personaliza con tu propio mensaje',
            slug: 'galletas-mensaje',
            basePrice: 15.99,
            displayOrder: 1,
          },
        }),
        this.category.upsert({
          where: { slug: 'galletas-foto' },
          update: {},
          create: {
            name: 'Galletas con Foto',
            description: 'Sube tu foto favorita',
            slug: 'galletas-foto',
            basePrice: 24.99,
            displayOrder: 2,
          },
        }),
        this.category.upsert({
          where: { slug: 'galletas-tematicas' },
          update: {},
          create: {
            name: 'Galletas Temáticas',
            description: 'Diseños especiales y temáticos',
            slug: 'galletas-tematicas',
            basePrice: 19.99,
            displayOrder: 3,
          },
        }),
        this.category.upsert({
          where: { slug: 'pack-mixto' },
          update: {},
          create: {
            name: 'Pack Mixto',
            description: 'Variedad de sabores y diseños',
            slug: 'pack-mixto',
            basePrice: 34.99,
            displayOrder: 4,
          },
        }),
      ]);
      void foto;
      void tematicas;
      void mixto;

      await this.product.upsert({
        where: { slug: 'mini-mensaje' },
        update: {},
        create: {
          name: 'Mini Galleta con Mensaje',
          slug: 'mini-mensaje',
          categoryId: mensaje.id,
          description: 'Pequeña galleta personalizada con tu mensaje',
          displayOrder: 1,
          customizations: JSON.stringify([
            { type: 'text', label: 'Mensaje', required: true, maxLength: 20 },
            {
              type: 'color',
              label: 'Color de Glaseado',
              required: false,
              allowedValues: ['rojo', 'azul', 'rosa', 'amarillo'],
            },
          ]),
        },
      });

      await this.appConfig.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          defaultExpressFee: 0.5,
          minOrderQuantity: 1,
          maxOrderQuantity: 100,
          maxFileSize: 5242880,
          allowedFileTypes: 'jpg,jpeg,png,webp',
          expressDeliveryHours: 24,
        },
      });

      console.log('✅ Starter catalog seeded');
    } catch (error) {
      console.warn('⚠️ Skipping seed (schema likely not migrated yet):', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}
