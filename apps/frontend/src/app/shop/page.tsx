'use client';

import CategoryGrid from '@/components/CategoryGrid';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">Shop</h1>
        <p className="text-chocolate/60 mb-12">Choose a category to start customizing</p>

        <CategoryGrid />
      </div>
    </div>
  );
}
