import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Obtener categoría con productos' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.productsService.getCategoryBySlug(slug);
  }

  @Get('list')
  @ApiOperation({ summary: 'Obtener productos (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllProducts(@Query() pagination: PaginationDto) {
    return this.productsService.getAllProducts(pagination.skip, pagination.limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener producto por slug' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Post()
  @ApiOperation({ summary: '[Admin] Crear producto' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '[Admin] Actualizar producto' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Eliminar producto' })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Put(':id/disable')
  @ApiOperation({ summary: '[Admin] Desactivar producto' })
  async disableProduct(@Param('id') id: string) {
    return this.productsService.disableProduct(id);
  }

  // Categorías Admin

  @Post('categories')
  @ApiOperation({ summary: '[Admin] Crear categoría' })
  async createCategory(@Body() data: any) {
    return this.productsService.createCategory(data);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: '[Admin] Actualizar categoría' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.productsService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '[Admin] Eliminar categoría' })
  async deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(id);
  }
}
