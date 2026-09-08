import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // DASHBOARD STATS
  // ============================================

  async getDashboardStats() {
    const [
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      totalProducts,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { email: true, name: true } },
          items: { select: { quantity: true } },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.customer.count(),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      totalProducts,
      totalCustomers,
    };
  }

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================

  async getOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { email: true, name: true, phone: true } },
          items: { select: { quantity: true, subtotal: true } },
          payment: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : order.notes,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================

  async getProducts(
    page: number = 1,
    limit: number = 20,
    search?: string,
    categoryId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { displayOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(data: any) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.product.create({
      data: {
        ...data,
        price: data.price || category.basePrice,
      },
      include: { category: true },
    });
  }

  async updateProduct(id: string, data: any) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (data.slug && data.slug !== product.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
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

  // ============================================
  // CATEGORIES MANAGEMENT
  // ============================================

  async getCategories(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { displayOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.category.count(),
    ]);

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(data: any) {
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: any) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
