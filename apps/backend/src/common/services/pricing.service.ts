import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

interface PricingInput {
  basePrice: number;
  quantity: number;
  expressApplied: boolean;
  config?: any;
}

interface PricingResult {
  unitPrice: number;
  subtotal: number;
  expressFee: number;
  total: number;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el precio de un item considerando cantidad y recargo express
   *
   * Reglas de negocio:
   * - Precio unitario = basePrice (sin descuentos por cantidad en MVP)
   * - Subtotal = unitPrice * cantidad
   * - Express fee = 50% del subtotal si se aplica (configurable)
   * - Total = Subtotal + expressFee
   */
  calculateItemPrice(input: PricingInput): PricingResult {
    const { basePrice, quantity, expressApplied, config } = input;

    // Validaciones
    if (quantity < 1 || quantity > 100) {
      throw new Error('Quantity must be between 1 and 100');
    }

    if (basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }

    // Obtener porcentaje de recargo express (default 50%)
    const EXPRESS_FEE_PERCENTAGE = config?.expressFeeFactor || 0.5;

    // Calcular precios
    const unitPrice = basePrice;
    const subtotal = unitPrice * quantity;
    const expressFee = expressApplied ? subtotal * EXPRESS_FEE_PERCENTAGE : 0;
    const total = subtotal + expressFee;

    return {
      unitPrice: Math.round(unitPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      expressFee: Math.round(expressFee * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calcula el total de un pedido con múltiples items
   */
  calculateOrderTotal(items: PricingInput[]): {
    subtotal: number;
    expressFee: number;
    total: number;
  } {
    let subtotal = 0;
    let expressFee = 0;

    for (const item of items) {
      const pricing = this.calculateItemPrice(item);
      subtotal += pricing.subtotal;
      expressFee += pricing.expressFee;
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      expressFee: Math.round(expressFee * 100) / 100,
      total: Math.round((subtotal + expressFee) * 100) / 100,
    };
  }

  /**
   * Aplica recargo global express a todos los items
   */
  applyGlobalExpress(items: PricingInput[]): PricingResult[] {
    return items.map((item) => ({
      ...item,
      expressApplied: true,
    }));
  }
}
