'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cart-store';
import CookiePreview, { CookieSize } from '@/components/CookiePreview';

interface Props {
  product: Product;
}

const SIZE_OPTIONS: CookieSize[] = ['Small', 'Medium', 'Large'];

export default function ProductDetail({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<CookieSize>('Medium');
  const [expressApplied, setExpressApplied] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = useCartStore((state) => state.addItem);

  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const expressFee = expressApplied ? subtotal * 0.5 : 0;
  const total = subtotal + expressFee;

  const colorCustom = product.customizations.find((c) => c.type === 'color');
  const messageCustom = product.customizations.find((c) => c.type === 'text');
  const selectCustom = product.customizations.find((c) => c.type === 'select');

  const handleCustomizationChange = (field: string, value: any) => {
    setCustomizations((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, foto: 'Only image files are allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, foto: 'Image must be under 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      handleCustomizationChange('image', file);
      handleCustomizationChange('imageUrl', url);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.foto;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    product.customizations.forEach((custom) => {
      if (!custom.required) return;

      if (custom.type === 'image') {
        if (!imagePreview) {
          newErrors.foto = `${custom.label} is required`;
        }
      } else {
        const value = customizations[custom.label];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[custom.label] = `${custom.label} is required`;
        } else if (custom.type === 'text' && custom.maxLength && value.length > custom.maxLength) {
          newErrors[custom.label] = `Maximum ${custom.maxLength} characters`;
        }
      }
    });

    if (!Number.isInteger(quantity) || quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    } else if (quantity > 100) {
      newErrors.quantity = 'Maximum 100 units';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!validate()) {
      return;
    }
    const finalCustomizations = { ...customizations, Size: size };
    addItem(product, quantity, finalCustomizations, expressApplied);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Live preview */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 flex items-center justify-center h-96">
        <CookiePreview
          sizeLabel={size}
          color={colorCustom ? customizations[colorCustom.label] : undefined}
          message={messageCustom ? customizations[messageCustom.label] : undefined}
          photoUrl={imagePreview}
          selection={selectCustom ? customizations[selectCustom.label] : undefined}
        />
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-chocolate mb-2">{product.name}</h1>
          <p className="text-chocolate/60 mb-6">{product.description}</p>

          {hasErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Please fix the fields marked below before continuing.
            </div>
          )}

          {/* Size selector — always available, drives the live preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <div className="flex gap-2">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium text-sm transition ${
                    size === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Customizations */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg">Customization</h3>

            {product.customizations.map((custom, i) => {
              const fieldError = custom.type === 'image' ? errors.foto : errors[custom.label];
              return (
                <div key={i}>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>
                      {custom.label}
                      {custom.required && <span className="text-red-600">*</span>}
                    </span>
                    {custom.type === 'text' && custom.maxLength && (
                      <span className="text-xs text-gray-400 font-normal">
                        {(customizations[custom.label]?.length || 0)}/{custom.maxLength}
                      </span>
                    )}
                  </label>

                  {custom.type === 'text' && (
                    <input
                      type="text"
                      maxLength={custom.maxLength}
                      value={customizations[custom.label] || ''}
                      onChange={(e) => handleCustomizationChange(custom.label, e.target.value)}
                      placeholder={`Max ${custom.maxLength} characters`}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        fieldError ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                  )}

                  {custom.type === 'color' && (
                    <div className="flex gap-2">
                      {custom.allowedValues?.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleCustomizationChange(custom.label, color)}
                          className={`w-12 h-12 rounded-lg border-2 transition ${
                            customizations[custom.label] === color
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}

                  {custom.type === 'image' && (
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                      />
                      {imagePreview && (
                        <p className="text-sm text-green-600">Image uploaded ✓</p>
                      )}
                    </div>
                  )}

                  {custom.type === 'select' && (
                    <select
                      value={customizations[custom.label] || ''}
                      onChange={(e) => handleCustomizationChange(custom.label, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        fieldError ? 'border-red-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select an option</option>
                      {custom.allowedValues?.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  )}

                  {fieldError && <p className="text-xs text-red-600 mt-1">{fieldError}</p>}
                </div>
              );
            })}
          </div>

          {/* Quantity & Express */}
          <div className="space-y-4 mb-6 border-t border-b py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className={`flex-1 px-3 py-2 border rounded-lg text-center ${
                    errors.quantity ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              {errors.quantity ? (
                <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Maximum 100 units</p>
              )}
            </div>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={expressApplied}
                onChange={(e) => setExpressApplied(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-medium text-sm">
                Express Delivery +50% (24 hours)
              </span>
            </label>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {expressApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Express Fee:</span>
                <span className="text-primary">${expressFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              addedToCart
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {addedToCart ? '✓ Added to cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
