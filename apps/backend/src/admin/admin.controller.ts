import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from '@/orders/dto/create-order.dto';
import { JwtAuthGuard } from '@/auth/jwt.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // DASHBOARD
  // ============================================

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ============================================
  // ORDERS
  // ============================================

  @Get('orders')
  @ApiOperation({ summary: 'List all orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrders(page, limit, status, search);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.notes);
  }

  // ============================================
  // PRODUCTS
  // ============================================

  @Get('products')
  @ApiOperation({ summary: 'List all products with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.adminService.getProducts(page, limit, search, categoryId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details' })
  async getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create new product' })
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ============================================
  // CATEGORIES
  // ============================================

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCategories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getCategories(page, limit);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category details' })
  async getCategory(@Param('id') id: string) {
    return this.adminService.getCategory(id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new category' })
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
