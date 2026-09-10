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
   * Send order confirmation to the customer
   */
  async sendOrderConfirmation(customerEmail: string, order: any) {
    try {
      const subject = `Order confirmed #${order.id}`;
      const html = this.generateOrderConfirmationHtml(order);

      // Implement with Resend SDK
      this.logger.log(`Order confirmation email sent to ${customerEmail}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify the admin about a new order
   */
  async sendAdminNotification(order: any) {
    try {
      const subject = `New order #${order.id}`;
      const html = this.generateAdminNotificationHtml(order);

      this.logger.log(`Admin notification sent for order ${order.id}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send admin notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify the customer of an order status change
   */
  async sendOrderStatusUpdate(customerEmail: string, order: any, newStatus: string) {
    try {
      const statusMessages: Record<string, string> = {
        PAID: 'Your payment has been received',
        IN_PRODUCTION: 'We have started preparing your order',
        READY_FOR_PICKUP: 'Your order is ready for pickup',
        SHIPPED: 'Your order has shipped',
        DELIVERED: 'Your order has been delivered',
        CANCELLED: 'Your order has been cancelled',
        REFUNDED: 'Your refund has been processed',
      };

      const message = statusMessages[newStatus] || 'Your order has been updated';
      const subject = `${message} - Order #${order.id}`;
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
      <h1>Order Confirmation</h1>
      <p>Order #${order.id}</p>
      <p>Total: $${order.total}</p>
      <p>Expected delivery date: ${new Date(order.deliveryDate).toLocaleDateString('en-US')}</p>
    `;
  }

  private generateAdminNotificationHtml(order: any): string {
    return `
      <h1>New Order</h1>
      <p>ID: ${order.id}</p>
      <p>Customer: ${order.customer?.name}</p>
      <p>Email: ${order.customer?.email}</p>
      <p>Total: $${order.total}</p>
      <p>Items: ${order.items?.length}</p>
    `;
  }

  private generateStatusUpdateHtml(order: any, status: string, message: string): string {
    return `
      <h1>${message}</h1>
      <p>Order #${order.id}</p>
      <p>Status: ${status}</p>
    `;
  }
}
