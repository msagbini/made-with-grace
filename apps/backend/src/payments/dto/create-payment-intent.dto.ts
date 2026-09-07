import { IsString, IsNumber, IsOptional, IsJSON } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsJSON()
  metadata?: Record<string, any>;
}

export class PaymentWebhookDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsJSON()
  data: Record<string, any>;
}
