'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Category, Product } from '@/types';
import { getCategoryVisual } from '@/lib/category-visuals';

type CategoryWithProducts = Category & { products: Product[] };

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<CategoryWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await productsApi.getCategoryBySlug(slug);
        setCategory(data);
      } catch (err) {
        setError('Category not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-chocolate/60">Loading...</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
          <Link href="/shop" className="text-primary font-semibold hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const visual = getCategoryVisual(category.slug);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-chocolate/60 hover:text-primary transition mb-6">
          ← Back to Shop
        </Link>

        <div className="mb-10">
          <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">{category.name}</h1>
          <p className="text-chocolate/60">{category.description}</p>
        </div>

        {category.products.length === 0 ? (
          <div className="text-center py-16 text-chocolate/60">
            No products available in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((product, i) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-chocolate/5 group-hover:shadow-xl group-hover:-translate-y-1 transition h-full flex flex-col">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-44 object-cover" />
                  ) : (
                    <div className={`bg-gradient-to-br ${visual.gradient} h-44 flex items-center justify-center text-6xl`}>
                      {visual.emoji}
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-serif font-semibold text-lg text-chocolate mb-1">{product.name}</h3>
                    <p className="text-sm text-chocolate/60 mb-3 flex-1">{product.description}</p>
                    <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
