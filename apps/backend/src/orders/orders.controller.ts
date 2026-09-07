import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============================================
  // PUBLIC ENDPOINTS (Cliente)
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Crear nuevo pedido' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de pedido' })
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Obtener pedidos del cliente por email' })
  async getOrdersByEmail(@Param('email') email: string) {
    return this.ordersService.getOrdersByCustomerEmail(email);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get()
  @ApiOperation({ summary: '[Admin] Listar todos los pedidos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listOrders(
    @Query('status') status?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.ordersService.listOrders(
      status,
      pagination?.skip || 0,
      pagination?.limit || 20,
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: '[Admin] Actualizar estado del pedido' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateDto);
  }
}
