'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [items]);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-chocolate/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🍪</span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-chocolate group-hover:text-primary transition">
            Sweet Grace
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/shop" className="text-sm sm:text-base font-medium text-chocolate hover:text-primary transition">
            Tienda
          </Link>
          <Link href="/cart" className="relative text-sm sm:text-base font-medium text-chocolate hover:text-primary transition flex items-center gap-1">
            <span>Carrito</span>
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
