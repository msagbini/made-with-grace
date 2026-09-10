'use client';

import Link from 'next/link';
import { getCategoryVisual } from '@/lib/category-visuals';
import CategoryIcon from '@/components/CategoryIcon';

const PREVIEW_CATEGORIES = [
  { slug: 'galletas-mensaje', name: 'Message Cookies', description: 'Personalize with your own message' },
  { slug: 'galletas-foto', name: 'Photo Cookies', description: 'Upload your favorite picture' },
  { slug: 'galletas-tematicas', name: 'Themed Cookies', description: 'Special occasion designs' },
  { slug: 'pack-mixto', name: 'Mixed Pack', description: 'A variety of flavors' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100">
        {/* Decorative blurred blobs */}
        <div className="animate-drift absolute -top-24 -left-24 w-72 h-72 bg-pink-300/40 rounded-full blur-3xl" />
        <div className="animate-drift absolute -bottom-24 -right-24 w-96 h-96 bg-amber-300/40 rounded-full blur-3xl" style={{ animationDelay: '-3s' }} />
        <div className="animate-drift absolute top-1/3 right-1/4 w-40 h-40 bg-fuchsia-300/30 rounded-full blur-2xl" style={{ animationDelay: '-6s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sweet Grace - Cakes & cookies made with love"
            className="animate-fade-in-up h-40 sm:h-52 w-auto mx-auto mb-8 drop-shadow-xl"
          />
          <h1 className="sr-only">Sweet Grace</h1>
          <span
            className="animate-fade-in-up inline-block bg-white/70 backdrop-blur px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-primary uppercase mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            Handmade · Premium Ingredients
          </span>
          <p
            className="animate-fade-in-up text-lg sm:text-xl text-chocolate/70 max-w-xl mx-auto mb-8"
            style={{ animationDelay: '0.2s' }}
          >
            Custom-designed cookies and cakes, baked fresh with love for every special occasion.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/shop">
              <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition">
                Shop the Full Collection
              </button>
            </Link>
          </div>

          <div
            className="animate-fade-in-up flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-chocolate/60"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🧑‍🍳</span> Handmade to order
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🔒</span> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🚚</span> Free shipping over $100
            </span>
          </div>
        </div>
      </section>

      {/* Category teasers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-chocolate mb-2">
            Our Categories
          </h2>
          <p className="text-chocolate/60 text-sm sm:text-base">Every creation, as unique as your occasion</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PREVIEW_CATEGORIES.map((category, i) => {
            const visual = getCategoryVisual(category.slug, i);
            return (
              <Link key={category.slug} href="/shop" className="group block">
                <div className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} rounded-2xl p-8 text-center h-40 flex items-center justify-center shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition`}>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                  <CategoryIcon icon={visual.icon} className="relative w-14 h-14 drop-shadow-sm" />
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
