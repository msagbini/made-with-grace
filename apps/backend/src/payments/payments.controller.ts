import { Controller, Post, Get, Body, Param, RawBody, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Crear PaymentIntent en Stripe' })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.orderId, dto.amount);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Procesar webhook de Stripe (endpoint privado)' })
  async handleWebhook(
    @RawBody() rawBody: string | Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Obtener estado de pago' })
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
