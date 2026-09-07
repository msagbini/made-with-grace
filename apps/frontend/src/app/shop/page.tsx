'use client';

import CategoryGrid from '@/components/CategoryGrid';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Catálogo</h1>
        <p className="text-gray-600 mb-12">Selecciona una categoría para comenzar a personalizar</p>

        <CategoryGrid />
      </div>
    </div>
  );
}
