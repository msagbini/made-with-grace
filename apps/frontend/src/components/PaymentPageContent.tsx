'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Order } from '@/types';

interface PaymentPageContentProps {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentPageContent({ onSuccess, onError }: PaymentPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar orden desde localStorage (temporalmente)
    const storedOrder = localStorage.getItem('pendingOrder');
    if (storedOrder && orderId) {
      try {
        const order = JSON.parse(storedOrder);
        if (order.id === orderId) {
          setOrder(order);
        }
      } catch (err) {
        setError('Error loading order');
      }
    } else if (!orderId) {
      setError('No order ID provided');
    }
    setLoading(false);
  }, [orderId]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Limpiar localStorage
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('pendingPaymentIntent');

    // Redirigir a confirmación
    router.push(`/order/${orderId}?success=true`);
    onSuccess?.(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onError?.(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Cargando información de pago...</div>
      </div>
    );
  }

  if (error || !order || !orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Error'}</p>
          <a href="/cart" className="text-primary font-semibold hover:underline">
            Volver al carrito
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Pago Seguro</h1>
        <p className="text-gray-600 mb-8">Completa tu pago para confirmar tu pedido</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="text-gray-600 text-center py-12">
                🔄 Integración de pagos en desarrollo. <br />
                <small>Por favor, contacta al equipo.</small>
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-600 space-y-2">
              <p>🔒 <strong>Pago seguro</strong> - Tu información se transmite cifrada</p>
              <p>✓ <strong>Stripe</strong> - Procesador de pagos confiable</p>
              <p>📱 <strong>Datos guardados</strong> - Para futuras compras</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-4 bg-gray-50 p-6 rounded-lg">
              <h2 className="font-bold text-lg mb-4">Resumen</h2>

              <div className="space-y-2 mb-4 pb-4 border-b">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="text-sm">
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-gray-600">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-600">
                    +{order.items.length - 2} más...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.expressFee > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Express:</span>
                    <span>${order.expressFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
