import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async getProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
