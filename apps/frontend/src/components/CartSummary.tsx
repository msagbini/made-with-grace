'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';

interface Props {
  compact?: boolean;
}

export default function CartSummary({ compact = false }: Props) {
  const { items, subtotal, expressFee, total, removeItem, updateQuantity, applyExpressGlobal } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-primary font-semibold hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {expressFee > 0 && (
          <div className="flex justify-between text-primary">
            <span>Express Fee:</span>
            <span>${expressFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-chocolate">Cart Summary</h2>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{item.product?.name || 'Product'}</h3>
                <p className="text-sm text-gray-600">
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <>
                      Customization: {JSON.stringify(item.customizations).substring(0, 50)}...
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Remove
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 border rounded hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">${item.unitPrice} × {item.quantity}</p>
                <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                {item.expressApplied && (
                  <p className="text-xs text-primary">Express: ${item.expressFee.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Express Toggle */}
      <div className="border-t pt-4">
        <label className="flex gap-2 items-center cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={expressFee > 0}
            onChange={(e) => applyExpressGlobal(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="font-medium">Apply Express to all items (+50%)</span>
        </label>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {expressFee > 0 && (
          <div className="flex justify-between text-primary">
            <span>Express Fee:</span>
            <span>${expressFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link href="/checkout" className="w-full">
        <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90">
          Proceed to Checkout
        </button>
      </Link>
    </div>
  );
}
