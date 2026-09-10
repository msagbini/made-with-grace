import type { Metadata } from 'next';
import '@/styles/globals.css';
import SiteChrome from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Sweet Grace - Galletas Personalizadas',
  description: 'Cakes & cookies made with love. Galletas y pasteles personalizados, horneados con cariño.',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Sweet Grace',
    description: 'Cakes & cookies made with love.',
    images: ['/logo-full.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Stripe for payments */}
        <script src="https://js.stripe.com/v3/"></script>
      </head>
      <body className="bg-cream text-chocolate font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
