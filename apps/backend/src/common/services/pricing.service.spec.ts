import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('PricingService', () => {
  let service: PricingService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('calculateItemPrice', () => {
    it('should calculate price without express', () => {
      const result = service.calculateItemPrice({
        basePrice: 10,
        quantity: 5,
        expressApplied: false,
      });

      expect(result.unitPrice).toBe(10);
      expect(result.subtotal).toBe(50);
      expect(result.expressFee).toBe(0);
      expect(result.total).toBe(50);
    });

    it('should calculate price with express (50% fee)', () => {
      const result = service.calculateItemPrice({
        basePrice: 20,
        quantity: 2,
        expressApplied: true,
      });

      expect(result.unitPrice).toBe(20);
      expect(result.subtotal).toBe(40);
      expect(result.expressFee).toBe(20); // 50% de 40
      expect(result.total).toBe(60);
    });

    it('should handle decimal prices correctly', () => {
      const result = service.calculateItemPrice({
        basePrice: 15.99,
        quantity: 3,
        expressApplied: false,
      });

      expect(result.unitPrice).toBe(15.99);
      expect(result.subtotal).toBe(47.97);
      expect(result.expressFee).toBe(0);
      expect(result.total).toBe(47.97);
    });

    it('should throw error for invalid quantity', () => {
      expect(() =>
        service.calculateItemPrice({
          basePrice: 10,
          quantity: 0,
          expressApplied: false,
        }),
      ).toThrow();

      expect(() =>
        service.calculateItemPrice({
          basePrice: 10,
          quantity: 101,
          expressApplied: false,
        }),
      ).toThrow();
    });

    it('should throw error for negative base price', () => {
      expect(() =>
        service.calculateItemPrice({
          basePrice: -10,
          quantity: 1,
          expressApplied: false,
        }),
      ).toThrow();
    });

    it('should use custom express fee factor', () => {
      const result = service.calculateItemPrice({
        basePrice: 100,
        quantity: 1,
        expressApplied: true,
        config: { expressFeeFactor: 0.3 },
      });

      expect(result.subtotal).toBe(100);
      expect(result.expressFee).toBe(30); // 30% de 100
      expect(result.total).toBe(130);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate total for multiple items', () => {
      const result = service.calculateOrderTotal([
        {
          basePrice: 10,
          quantity: 2,
          expressApplied: false,
        },
        {
          basePrice: 20,
          quantity: 1,
          expressApplied: true,
        },
      ]);

      // Item 1: 10 * 2 = 20, express = 0
      // Item 2: 20 * 1 = 20, express = 10
      expect(result.subtotal).toBe(40);
      expect(result.expressFee).toBe(10);
      expect(result.total).toBe(50);
    });

    it('should handle empty items', () => {
      const result = service.calculateOrderTotal([]);

      expect(result.subtotal).toBe(0);
      expect(result.expressFee).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('applyGlobalExpress', () => {
    it('should apply express to all items', () => {
      const items = [
        { basePrice: 10, quantity: 1, expressApplied: false },
        { basePrice: 20, quantity: 1, expressApplied: false },
      ];

      const result = service.applyGlobalExpress(items);

      expect(result[0].expressApplied).toBe(true);
      expect(result[1].expressApplied).toBe(true);
    });
  });
});
