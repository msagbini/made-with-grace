import { Suspense } from 'react';
import { PaymentPageContent } from '@/components/PaymentPageContent';

export const metadata = {
  title: 'Secure Payment | Sweet Grace Shop',
  description: 'Complete your payment securely',
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
