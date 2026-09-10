import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      await this.syncStarterCatalog();
      await this.seedAdminIfMissing();
    } catch (error) {
      console.warn('⚠️ Database connection failed, will retry on first query', error.message);
    }
  }

  private async syncStarterCatalog() {
    try {
      const categories = [
        { slug: 'galletas-mensaje', name: 'Message Cookies', description: 'Personalize with your own message', basePrice: 15.99, displayOrder: 1 },
        { slug: 'galletas-foto', name: 'Photo Cookies', description: 'Upload your favorite photo', basePrice: 24.99, displayOrder: 2 },
        { slug: 'galletas-tematicas', name: 'Themed Cookies', description: 'Special occasion designs', basePrice: 19.99, displayOrder: 3 },
        { slug: 'pack-mixto', name: 'Mixed Pack', description: 'A variety of flavors and designs', basePrice: 34.99, displayOrder: 4 },
      ];

      const savedCategories: Record<string, { id: string }> = {};
      for (const { slug, ...fields } of categories) {
        savedCategories[slug] = await this.category.upsert({
          where: { slug },
          update: fields,
          create: { slug, ...fields },
        });
      }

      const colorCustomization = {
        type: 'color',
        label: 'Icing Color',
        required: false,
        allowedValues: ['#ef4444', '#3b82f6', '#ec4899', '#f59e0b'],
      };

      const products = [
        {
          slug: 'mini-mensaje',
          categorySlug: 'galletas-mensaje',
          name: 'Mini Message Cookie',
          description: 'A small cookie personalized with your message',
          price: 15.99,
          displayOrder: 1,
          customizations: [
            { type: 'text', label: 'Message', required: true, maxLength: 20 },
            colorCustomization,
          ],
        },
        {
          slug: 'docena-mensaje',
          categorySlug: 'galletas-mensaje',
          name: 'Message Cookie Dozen',
          description: '12 personalized cookies, perfect for gifting',
          price: 42.99,
          displayOrder: 2,
          customizations: [
            { type: 'text', label: 'Message', required: true, maxLength: 20 },
            colorCustomization,
          ],
        },
        {
          slug: 'foto-clasica',
          categorySlug: 'galletas-foto',
          name: 'Classic Photo Cookie',
          description: 'Edible print of your favorite photo',
          price: 24.99,
          displayOrder: 1,
          customizations: [{ type: 'image', label: 'Photo', required: true }],
        },
        {
          slug: 'foto-pack',
          categorySlug: 'galletas-foto',
          name: '6-Photo Pack',
          description: '6 cookies, a different photo on each one',
          price: 59.99,
          displayOrder: 2,
          customizations: [{ type: 'image', label: 'Photo', required: true }],
        },
        {
          slug: 'tematica-cumple',
          categorySlug: 'galletas-tematicas',
          name: 'Birthday Themed Set',
          description: 'Festive designs for birthdays',
          price: 19.99,
          displayOrder: 1,
          customizations: [
            { type: 'select', label: 'Theme', required: true, allowedValues: ['Birthday', 'Baby Shower', 'Wedding'] },
          ],
        },
        {
          slug: 'tematica-boda',
          categorySlug: 'galletas-tematicas',
          name: 'Wedding Themed Set',
          description: 'Elegant cookies for the big day',
          price: 29.99,
          displayOrder: 2,
          customizations: [
            { type: 'color', label: 'Color', required: false, allowedValues: ['#ffffff', '#f5d0d0', '#d4af37'] },
          ],
        },
        {
          slug: 'pack-mixto-18',
          categorySlug: 'pack-mixto',
          name: 'Mixed Pack x18',
          description: 'A variety of flavors and designs, great for sharing',
          price: 34.99,
          displayOrder: 1,
          customizations: [],
        },
      ];

      for (const { slug, categorySlug, ...fields } of products) {
        const categoryId = savedCategories[categorySlug].id;
        await this.product.upsert({
          where: { slug },
          update: { ...fields, categoryId },
          create: { slug, categoryId, ...fields },
        });
      }

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
    } catch (error) {
      console.warn('⚠️ Skipping catalog sync (schema likely not migrated yet):', error.message);
    }
  }

  private async seedAdminIfMissing() {
    try {
      const existing = await this.adminUser.findUnique({
        where: { email: 'admin@sweetgrace.com' },
      });
      if (existing) {
        return;
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.adminUser.create({
        data: {
          email: 'admin@sweetgrace.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN',
          active: true,
        },
      });
      console.log('✅ Admin user created (admin@sweetgrace.com)');
    } catch (error) {
      console.warn('⚠️ Skipping admin seed:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}
