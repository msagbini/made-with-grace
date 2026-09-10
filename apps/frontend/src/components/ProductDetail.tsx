'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cart-store';

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [expressApplied, setExpressApplied] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const expressFee = expressApplied ? subtotal * 0.5 : 0;
  const total = subtotal + expressFee;

  const handleCustomizationChange = (field: string, value: any) => {
    setCustomizations((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImagePreview(url);
        handleCustomizationChange('image', file);
        handleCustomizationChange('imageUrl', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity, customizations, expressApplied);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 flex items-center justify-center h-96">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
        ) : product.image ? (
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain rounded-lg" />
        ) : (
          <span className="text-8xl">🍪</span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Customizations */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg">Personalización</h3>

            {product.customizations.map((custom, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {custom.label}
                  {custom.required && <span className="text-red-600">*</span>}
                </label>

                {custom.type === 'text' && (
                  <input
                    type="text"
                    maxLength={custom.maxLength}
                    value={customizations[custom.label] || ''}
                    onChange={(e) => handleCustomizationChange(custom.label, e.target.value)}
                    placeholder={`Max ${custom.maxLength} caracteres`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                      <p className="text-sm text-green-600">Imagen cargada ✓</p>
                    )}
                  </div>
                )}

                {custom.type === 'select' && (
                  <select
                    value={customizations[custom.label] || ''}
                    onChange={(e) => handleCustomizationChange(custom.label, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona una opción</option>
                    {custom.allowedValues?.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Quantity & Express */}
          <div className="space-y-4 mb-6 border-t border-b py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Máximo 100 unidades</p>
            </div>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={expressApplied}
                onChange={(e) => setExpressApplied(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-medium text-sm">
                Entrega Express +50% (24 horas)
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
                <span className="text-gray-600">Recargo Express:</span>
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
            {addedToCart ? '✓ Añadido al carrito' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
