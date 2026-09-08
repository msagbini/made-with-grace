import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, OrderStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo pedido
   * 1. Crear/obtener cliente por email
   * 2. Crear order
   * 3. Crear order_items con detalles de personalización
   * 4. Retornar order completa
   */
  async createOrder(createOrderDto: CreateOrderDto) {
    const { email, items, ...orderData } = createOrderDto;

    // Validar que hay al menos un item
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Obtener o crear cliente
    let customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          email,
          name: orderData.name || 'Unknown',
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          zip: orderData.zip,
          country: orderData.country,
        },
      });
    }

    // Validar que todos los productos existen
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Crear orden en transacción
    const order = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.order.create({
        data: {
          customerId: customer.id,
          subtotal: createOrderDto.subtotal,
          expressFee: createOrderDto.expressFee || 0,
          shippingCost: 0,
          tax: 0,
          total: createOrderDto.total,
          deliveryDate: createOrderDto.deliveryDate,
          status: 'PENDING',
          notes: orderData.notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              expressApplied: item.expressApplied || false,
              expressFee: item.expressApplied ? item.unitPrice * item.quantity * 0.5 : 0,
              subtotal: item.unitPrice * item.quantity,
              customizations: item.customizations || {},
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });
    });

    return order;
  }

  /**
   * Obtener pedido por ID
   */
  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Obtener pedidos de un cliente por email
   */
  async getOrdersByCustomerEmail(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return [];
    }

    return this.prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar todos los pedidos (admin)
   */
  async listOrders(status?: string, skip = 0, take = 20) {
    return this.prisma.order.findMany({
      where: status ? { status: status as unknown as OrderStatus } : {},
      include: {
        items: true,
        customer: { select: { email: true, name: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Actualizar estado de pedido (admin)
   */
  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateDto.status,
        notes: updateDto.notes || order.notes,
        updatedAt: new Date(),
      },
      include: { items: true, customer: true },
    });
  }

  /**
   * Cancelar pedido (si aún no está en producción)
   */
  async cancelOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (['IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel order in this status');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', updatedAt: new Date() },
    });
  }
}
