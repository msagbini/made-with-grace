'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        setError('No se encontró el producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error || 'Producto no encontrado'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
