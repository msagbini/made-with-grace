'use client';

import Link from 'next/link';
import { getCategoryVisual } from '@/lib/category-visuals';

const PREVIEW_CATEGORIES = [
  { slug: 'galletas-mensaje', name: 'Galletas con Mensaje', description: 'Personaliza con tu mensaje' },
  { slug: 'galletas-foto', name: 'Galletas con Foto', description: 'Sube tu imagen favorita' },
  { slug: 'galletas-tematicas', name: 'Galletas Temáticas', description: 'Diseños especiales' },
  { slug: 'pack-mixto', name: 'Pack Mixto', description: 'Variedad de sabores' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="text-6xl mb-6">🍪</div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-chocolate mb-4">
            Sweet Grace
          </h1>
          <p className="text-lg sm:text-xl text-chocolate/70 max-w-xl mx-auto mb-10">
            Galletas personalizadas, horneadas con cariño para cada ocasión especial.
          </p>
          <Link href="/shop">
            <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl transition">
              Ver Tienda Completa
            </button>
          </Link>
        </div>
      </section>

      {/* Category teasers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-chocolate text-center mb-10">
          Nuestras Categorías
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PREVIEW_CATEGORIES.map((category, i) => {
            const visual = getCategoryVisual(category.slug, i);
            return (
              <Link key={category.slug} href="/shop" className="group block">
                <div className={`bg-gradient-to-br ${visual.gradient} rounded-2xl p-8 text-center h-40 flex items-center justify-center text-5xl shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition`}>
                  {visual.emoji}
                </div>
                <h3 className="font-serif font-semibold text-lg text-chocolate mt-4 mb-1">{category.name}</h3>
                <p className="text-sm text-chocolate/60">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
