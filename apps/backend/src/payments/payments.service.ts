import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPaymentIntent(orderId: string, amount: number) {
    // Implementar Stripe integration
    return { orderId, amount, status: 'pending' };
  }

  async handleWebhook(event: any) {
    // Procesar webhooks de Stripe
  }
}
