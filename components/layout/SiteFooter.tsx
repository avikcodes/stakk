import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/80 bg-white/70">
      <div className="px-6 py-10 sm:py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          {/* Column 1: Product */}
          <section className="min-w-0 sm:basis-0 sm:grow">
            <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
              Product
            </h2>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/features"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Pricing ($129/mo)
                </Link>
              </li>
              <li>
                <Link
                  href="/use-cases"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Use Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/stak-vs-gehirn"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Stak vs Gehirn
                </Link>
              </li>
            </ul>
          </section>

          {/* Column 2: Resources */}
          <section className="min-w-0 sm:basis-0 sm:grow">
            <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
              Resources
            </h2>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/blog"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Guides & Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/alternatives"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Alternatives Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/alternatives/gehirn"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Gehirn Alternative
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Comparisons
                </Link>
              </li>
            </ul>
          </section>

          {/* Column 3: Company */}
          <section className="min-w-0 sm:basis-0 sm:grow">
            <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
              Company
            </h2>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  About Stak
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[13px] text-stone-600 hover:text-[#14181f] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-200/70">
        <div className="flex flex-col gap-3 px-6 py-4 text-[12px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-5 text-stone-500">
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-stone-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-stone-900 transition-colors">
              Terms
            </Link>
            <Link href="/security" className="hover:text-stone-900 transition-colors">
              Security
            </Link>
            <Link href="/contact" className="hover:text-stone-900 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="font-mono text-[11px] text-stone-500">
            Stak · stak.co.in · All capabilities · $129/month flat plan
          </div>
        </div>
      </div>
    </footer>
  );
}
