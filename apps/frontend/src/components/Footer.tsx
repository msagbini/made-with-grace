export default function Footer() {
  return (
    <footer className="mt-24 border-t border-chocolate/10 bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sweet Grace" className="h-10 w-auto" />
        </div>
        <p className="text-sm text-chocolate/60 text-center">
          Galletas personalizadas, horneadas con cariño.
        </p>
        <a href="mailto:hola@sweetgrace.com" className="text-sm text-chocolate/60 hover:text-primary transition">
          hola@sweetgrace.com
        </a>
      </div>
    </footer>
  );
}
