'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Category } from '@/types';
import { getCategoryVisual } from '@/lib/category-visuals';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productsApi.getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-56 bg-chocolate/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 text-chocolate/60">
        No categories available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category, i) => {
        const visual = getCategoryVisual(category.slug, i);
        return (
          <Link key={category.id} href={`/shop/${category.slug}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-chocolate/5 group-hover:shadow-xl group-hover:-translate-y-1 transition h-full flex flex-col">
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-full h-36 object-cover" />
              ) : (
                <div className={`bg-gradient-to-br ${visual.gradient} h-36 flex items-center justify-center text-5xl`}>
                  {visual.emoji}
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-serif font-semibold text-lg text-chocolate mb-1">{category.name}</h3>
                <p className="text-sm text-chocolate/60 mb-3 flex-1">{category.description}</p>
                <p className="font-bold text-primary">From ${category.basePrice.toFixed(2)}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
