import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  async createPaymentIntent(@Body() data: any) {
    return this.paymentsService.createPaymentIntent(data.orderId, data.amount);
  }

  @Post('webhook')
  async handleWebhook(@Body() event: any) {
    return this.paymentsService.handleWebhook(event);
  }
}
