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
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Enter a valid email';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name is too short';
    }

    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid phone number';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.deliveryDate) {
      errors.deliveryDate = 'Select a delivery date';
    } else if (formData.deliveryDate < today) {
      errors.deliveryDate = 'Date cannot be in the past';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!validateForm()) {
      setError('Please fix the fields marked in red');
      return;
    }

    setLoading(true);

    try {
      // Create order
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

      // Create PaymentIntent in Stripe
      const paymentIntent = await paymentsApi.createPaymentIntent(order.id, total);

      // Redirect to Stripe Checkout (to implement in the next phase)
      // For now, show a temporary confirmation
      localStorage.setItem('pendingOrder', JSON.stringify(order));
      localStorage.setItem('pendingPaymentIntent', JSON.stringify(paymentIntent));

      // Clear cart
      clear();

      // Redirect to confirmation
      router.push(`/checkout/confirm?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing your order');
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
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <a href="/shop" className="text-primary font-semibold hover:underline">
              Back to shop
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
        <h1 className="font-serif text-3xl font-bold text-chocolate mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
              {error && (
                <div className="animate-shake bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
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
                      placeholder="Full Name *"
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
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass('phone')}
                    />
                    {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Address *"
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
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      name="zip"
                      placeholder="ZIP/Postal Code"
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
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <h2 className="text-xl font-bold mb-4">Preferred Delivery Date</h2>
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

              {/* Additional Notes */}
              <div>
                <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
                <textarea
                  name="notes"
                  placeholder="Notes for preparing your order..."
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
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
              <p className="text-center text-xs text-chocolate/50 flex items-center justify-center gap-1.5">
                <span aria-hidden>🔒</span> Secure checkout · Your information is protected
              </p>
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
