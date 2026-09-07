import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        orderId,
      },
      description: `Order #${orderId}`,
    });

    this.logger.log(`PaymentIntent created: ${paymentIntent.id} for order ${orderId}`);

    await this.prisma.payment.create({
      data: {
        orderId,
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id,
        amount,
        currency: 'USD',
        status: 'PENDING',
        metadata: {
          clientSecret: paymentIntent.client_secret,
        },
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: this.configService.get<string>('STRIPE_PUBLIC_KEY'),
    };
  }

  async handleWebhook(rawBody: string | Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const order = await this.prisma.order.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!order) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { providerPaymentId: paymentIntent.id },
        data: {
          status: 'SUCCEEDED',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          updatedAt: new Date(),
        },
      });
    });

    this.logger.log(`Payment succeeded for order ${order.id}`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { providerPaymentId: paymentIntent.id },
      data: {
        status: 'FAILED',
      },
    });

    this.logger.log(`Payment failed for PaymentIntent ${paymentIntent.id}`);
  }

  private async handleRefund(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) return;

    const order = await this.prisma.order.findFirst({
      where: { paymentIntentId },
    });

    if (!order) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { providerPaymentId: paymentIntentId },
        data: {
          status: 'REFUNDED',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });
    });

    this.logger.log(`Refund processed for order ${order.id}`);
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      status: payment.status,
      provider: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
    };
  }
}
