'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sweet Grace</h1>
            <p className="text-gray-600">Galletas Personalizadas</p>
          </div>
          <div className="flex gap-4">
            <Link href="/shop" className="text-primary font-semibold hover:underline">
              Tienda
            </Link>
            <Link href="/cart" className="text-primary font-semibold hover:underline">
              Carrito
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/shop" className="border rounded-lg p-6 hover:shadow-lg hover:border-primary transition block">
            <h3 className="font-semibold mb-2">Galletas con Mensaje</h3>
            <p className="text-gray-600">Personaliza con tu mensaje</p>
          </Link>
          <Link href="/shop" className="border rounded-lg p-6 hover:shadow-lg hover:border-primary transition block">
            <h3 className="font-semibold mb-2">Galletas con Foto</h3>
            <p className="text-gray-600">Sube tu imagen favorita</p>
          </Link>
          <Link href="/shop" className="border rounded-lg p-6 hover:shadow-lg hover:border-primary transition block">
            <h3 className="font-semibold mb-2">Galletas Temáticas</h3>
            <p className="text-gray-600">Diseños especiales</p>
          </Link>
          <Link href="/shop" className="border rounded-lg p-6 hover:shadow-lg hover:border-primary transition block">
            <h3 className="font-semibold mb-2">Pack Mixto</h3>
            <p className="text-gray-600">Variedad de sabores</p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/shop">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition">
              Ver Tienda Completa
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
