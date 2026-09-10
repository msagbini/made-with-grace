export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-chocolate/10 bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center sm:items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sweet Grace" className="h-12 w-auto" />
            <p className="text-sm text-chocolate/60 text-center sm:text-left">
              Custom cookies &amp; cakes, baked fresh with love.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h4 className="font-serif font-semibold text-chocolate mb-1">Why Sweet Grace</h4>
            <p className="text-sm text-chocolate/60 flex items-center gap-1.5">
              <span aria-hidden>🧑‍🍳</span> Handmade to order
            </p>
            <p className="text-sm text-chocolate/60 flex items-center gap-1.5">
              <span aria-hidden>🌿</span> Premium ingredients
            </p>
            <p className="text-sm text-chocolate/60 flex items-center gap-1.5">
              <span aria-hidden>🔒</span> Secure checkout
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <h4 className="font-serif font-semibold text-chocolate mb-1">Get in touch</h4>
            <a href="mailto:hello@sweetgrace.com" className="text-sm text-chocolate/60 hover:text-primary transition">
              hello@sweetgrace.com
            </a>
            <p className="text-sm text-chocolate/60">Mon–Fri, 9am–5pm</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-chocolate/10 text-center">
          <p className="text-xs text-chocolate/40">© {year} Sweet Grace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
