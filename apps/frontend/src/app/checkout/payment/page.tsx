import { Suspense } from 'react';
import { PaymentPageContent } from '@/components/PaymentPageContent';

export const metadata = {
  title: 'Pago Seguro | Sweet Grace Shop',
  description: 'Completa tu pago de forma segura',
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
