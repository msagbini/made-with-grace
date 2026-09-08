import { Suspense } from 'react';
import { ConfirmPageContent } from '@/components/ConfirmPageContent';

export const metadata = {
  title: 'Confirmación de Pedido | Sweet Grace Shop',
  description: 'Tu pedido ha sido confirmado exitosamente',
};

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
