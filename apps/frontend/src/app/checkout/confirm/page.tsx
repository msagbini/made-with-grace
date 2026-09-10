import { Suspense } from 'react';
import { ConfirmPageContent } from '@/components/ConfirmPageContent';

export const metadata = {
  title: 'Order Confirmation | Sweet Grace Shop',
  description: 'Your order has been successfully confirmed',
};

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
