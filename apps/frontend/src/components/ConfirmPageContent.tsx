'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';

export function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order found');
        setLoading(false);
        return;
      }

      try {
        const data = await ordersApi.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError('Error loading order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Cargando confirmación...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Error'}</p>
          <Link href="/shop" className="text-primary font-semibold hover:underline">
            Volver a tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-600">Tu pedido ha sido creado exitosamente</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          {/* Order Summary */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">ID del Pedido:</span>
                <span className="font-mono font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-blue-600">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold mb-4">Elementos del Pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.expressFee > 0 && (
              <div className="flex justify-between text-primary">
                <span>Recargo Express:</span>
                <span>${order.expressFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold mb-4">Información de Entrega</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">{order.name}</span>
              </p>
              <p>{order.address}</p>
              {order.city && <p>{order.city}, {order.zip}</p>}
              <p className="text-gray-600">
                Fecha esperada: {new Date(order.deliveryDate).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Próximos Pasos</h3>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>✓ Recibirás un email de confirmación en {order.email}</li>
              <li>✓ Procederemos con el pago en el siguiente paso</li>
              <li>✓ Te notificaremos cuando inicie la elaboración</li>
              <li>✓ Recibirás actualizaciones del estado del pedido</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50">
              Ver Pedido
            </button>
            <Link href="/shop">
              <button className="bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 w-full">
                Continuar Comprando
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
