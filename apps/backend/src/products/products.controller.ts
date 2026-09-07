import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Obtener categoría con productos' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.productsService.getCategoryBySlug(slug);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener producto por slug' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }
}
