import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendOrderConfirmation(email: string, order: any) {
    // Implementar con Resend
    console.log(`Sending order confirmation to ${email}`);
  }

  async sendAdminNotification(order: any) {
    // Notificar al admin
  }
}
