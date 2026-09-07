import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Sweet Grace - Galletas Personalizadas',
  description: 'Galletas personalizadas con previsualización 2D/3D',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Stripe for payments */}
        <script src="https://js.stripe.com/v3/"></script>
      </head>
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
