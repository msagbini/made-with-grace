'use client';

import CartSummary from '@/components/CartSummary';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CartSummary />
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Información de Entrega</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Entrega en 3-5 días</p>
                  <p>✓ Envío gratis para pedidos +$100</p>
                  <p>✓ Garantía de satisfacción</p>
                  <p>✓ Opción Express (24 horas)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
