import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // PUBLIC ENDPOINTS (Cliente)
  // ============================================

  async getCategories() {
    return this.prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        basePrice: true,
        image: true,
      },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            price: true,
            customizations: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${slug} not found`);
    }

    return category;
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${slug} not found`);
    }

    return product;
  }

  async getAllProducts(skip = 0, take = 20) {
    return this.prisma.product.findMany({
      where: { active: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
      skip,
      take,
    });
  }

  // ============================================
  // ADMIN ENDPOINTS (CRUD)
  // ============================================

  async createProduct(createProductDto: CreateProductDto) {
    // Validar que la categoría existe
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validar slug único
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingProduct) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        price: createProductDto.price || category.basePrice,
      },
      include: { category: true },
    });
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async disableProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  // Categorías Admin

  async createCategory(data: any) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
