'use client';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Sweet Grace</h1>
          <p className="text-gray-600">Galletas Personalizadas</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Componentes de categorías irán aquí */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Galletas con Mensaje</h3>
            <p className="text-gray-600">Personaliza con tu mensaje</p>
          </div>
          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Galletas con Foto</h3>
            <p className="text-gray-600">Sube tu imagen favorita</p>
          </div>
          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Galletas Temáticas</h3>
            <p className="text-gray-600">Diseños especiales</p>
          </div>
          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Pack Mixto</h3>
            <p className="text-gray-600">Variedad de sabores</p>
          </div>
        </div>
      </main>
    </div>
  );
}
