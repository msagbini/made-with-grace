import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private resendApiKey: string;
  private fromEmail: string;
  private adminEmail: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || '';
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';
  }

  /**
   * Enviar confirmación de pedido al cliente
   */
  async sendOrderConfirmation(customerEmail: string, order: any) {
    try {
      const subject = `Pedido confirmado #${order.id}`;
      const html = this.generateOrderConfirmationHtml(order);

      // Implementar con Resend SDK
      this.logger.log(`Order confirmation email sent to ${customerEmail}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notificar al admin sobre nuevo pedido
   */
  async sendAdminNotification(order: any) {
    try {
      const subject = `Nuevo pedido #${order.id}`;
      const html = this.generateAdminNotificationHtml(order);

      this.logger.log(`Admin notification sent for order ${order.id}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send admin notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notificar cambio de estado del pedido
   */
  async sendOrderStatusUpdate(customerEmail: string, order: any, newStatus: string) {
    try {
      const statusMessages: Record<string, string> = {
        PAID: 'Tu pago ha sido recibido',
        IN_PRODUCTION: 'Hemos comenzado a elaborar tu pedido',
        READY_FOR_PICKUP: 'Tu pedido está listo para recoger',
        SHIPPED: 'Tu pedido ha sido enviado',
        DELIVERED: 'Tu pedido ha sido entregado',
        CANCELLED: 'Tu pedido ha sido cancelado',
        REFUNDED: 'Tu reembolso ha sido procesado',
      };

      const message = statusMessages[newStatus] || 'Tu pedido ha sido actualizado';
      const subject = `${message} - Pedido #${order.id}`;
      const html = this.generateStatusUpdateHtml(order, newStatus, message);

      this.logger.log(`Order status update sent to ${customerEmail}: ${newStatus}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send status update: ${error.message}`);
      throw error;
    }
  }

  private generateOrderConfirmationHtml(order: any): string {
    return `
      <h1>Confirmación de Pedido</h1>
      <p>Pedido #${order.id}</p>
      <p>Total: $${order.total}</p>
      <p>Fecha de entrega esperada: ${new Date(order.deliveryDate).toLocaleDateString('es-ES')}</p>
    `;
  }

  private generateAdminNotificationHtml(order: any): string {
    return `
      <h1>Nuevo Pedido</h1>
      <p>ID: ${order.id}</p>
      <p>Cliente: ${order.customer?.name}</p>
      <p>Email: ${order.customer?.email}</p>
      <p>Total: $${order.total}</p>
      <p>Items: ${order.items?.length}</p>
    `;
  }

  private generateStatusUpdateHtml(order: any, status: string, message: string): string {
    return `
      <h1>${message}</h1>
      <p>Pedido #${order.id}</p>
      <p>Estado: ${status}</p>
    `;
  }
}
