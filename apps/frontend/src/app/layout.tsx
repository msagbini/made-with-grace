import type { Metadata } from 'next';
import '@/styles/globals.css';
import SiteChrome from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Sweet Grace - Galletas Personalizadas',
  description: 'Galletas personalizadas con previsualización 2D/3D',
  viewport: 'width=device-width, initial-scale=1',
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
