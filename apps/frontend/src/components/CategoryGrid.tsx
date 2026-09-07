'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Category } from '@/types';

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
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/shop/${category.slug}`}>
          <div className="group rounded-lg border border-gray-200 hover:border-primary p-6 text-center hover:shadow-lg transition cursor-pointer bg-white">
            {category.image && (
              <div className="w-full h-32 bg-gray-100 rounded mb-4 flex items-center justify-center">
                <img src={category.image} alt={category.name} className="max-h-32 object-contain" />
              </div>
            )}
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            <p className="font-bold text-primary">${category.basePrice}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
