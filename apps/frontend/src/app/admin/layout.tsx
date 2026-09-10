'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hasHydrated } = useAdminStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Wait for the persisted session to load from localStorage before deciding
    // whether to redirect — otherwise a page refresh always bounces to login.
    if (!hasHydrated) return;
    if (!isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [hasHydrated, isAuthenticated, isLoginPage, router]);

  // Show login page without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Don't show layout until we know whether the session is authenticated
  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/analytics', label: 'Analytics' },
  ];

  const sidebarNav = (
    <>
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sweet Grace" className="h-12 w-12 rounded-full" />
        <div>
          <h1 className="text-lg font-bold leading-tight">Sweet Grace</h1>
          <p className="text-gray-400 text-xs">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-lg transition ${
              pathname === item.href
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-4">
        <div className="text-sm">
          <p className="text-gray-400">Logged in as</p>
          <p className="text-white font-medium">{user?.name}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar — permanent on desktop, off-canvas drawer on mobile */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col">{sidebarNav}</div>

      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-900 text-white flex flex-col">{sidebarNav}</div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden -ml-1 p-2 text-gray-500 hover:text-gray-900"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h2>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
