'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CartSummary from '@/components/CartSummary';
import { useCartStore } from '@/lib/cart-store';
import { ordersApi, paymentsApi } from '@/lib/api';
import { CreateOrderDto } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s()-]{6,}$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, expressFee, total, clear } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'US',
    deliveryDate: '',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Ingresa un email válido';
    }

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre es demasiado corto';
    }

    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = 'Ingresa un teléfono válido';
    }

    if (!formData.address.trim()) {
      errors.address = 'La dirección es obligatoria';
    }

    if (!formData.deliveryDate) {
      errors.deliveryDate = 'Selecciona una fecha de entrega';
    } else if (formData.deliveryDate < today) {
      errors.deliveryDate = 'La fecha no puede ser en el pasado';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Tu carrito está vacío');
      return;
    }

    if (!validateForm()) {
      setError('Por favor corrige los campos marcados en rojo');
      return;
    }

    setLoading(true);

    try {
      // Crear orden
      const orderData: CreateOrderDto = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zip: formData.zip.trim(),
        country: formData.country,
        deliveryDate: formData.deliveryDate,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          expressApplied: item.expressApplied,
          customizations: item.customizations,
        })),
        subtotal,
        expressFee,
        total,
        notes: formData.notes,
      };

      const order = await ordersApi.createOrder(orderData);
      setOrderId(order.id);

      // Crear PaymentIntent en Stripe
      const paymentIntent = await paymentsApi.createPaymentIntent(order.id, total);

      // Redirigir a Stripe Checkout (implementar en fase siguiente)
      // Por ahora, mostrar confirmación temporal
      localStorage.setItem('pendingOrder', JSON.stringify(order));
      localStorage.setItem('pendingPaymentIntent', JSON.stringify(paymentIntent));

      // Limpiar carrito
      clear();

      // Redirigir a confirmación
      router.push(`/checkout/confirm?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <a href="/shop" className="text-primary font-semibold hover:underline">
              Volver a comprar
            </a>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
      fieldErrors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Información de Contacto */}
              <div>
                <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass('email')}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre Completo *"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClass('name')}
                    />
                    {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Teléfono"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass('phone')}
                    />
                    {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Dirección de Entrega */}
              <div>
                <h2 className="text-xl font-bold mb-4">Dirección de Entrega</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Dirección *"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass('address')}
                    />
                    {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="Ciudad"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      name="zip"
                      placeholder="ZIP/Código Postal"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="US">Estados Unidos</option>
                    <option value="CA">Canadá</option>
                    <option value="MX">México</option>
                  </select>
                </div>
              </div>

              {/* Fecha de Entrega */}
              <div>
                <h2 className="text-xl font-bold mb-4">Fecha de Entrega Deseada</h2>
                <input
                  type="date"
                  name="deliveryDate"
                  min={today}
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className={inputClass('deliveryDate')}
                />
                {fieldErrors.deliveryDate && <p className="text-xs text-red-600 mt-1">{fieldErrors.deliveryDate}</p>}
              </div>

              {/* Notas */}
              <div>
                <h2 className="text-xl font-bold mb-4">Notas Adicionales</h2>
                <textarea
                  name="notes"
                  placeholder="Notas para la elaboración del pedido..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Continuar al Pago'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-4">
              <CartSummary compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
