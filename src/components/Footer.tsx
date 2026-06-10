import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[var(--accent)] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xs" style={{ fontFamily: 'var(--font-display)' }}>P</span>
              </div>
              <span className="text-lg tracking-tight font-semibold">
                PRINT<span className="text-[var(--accent)]">POD</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Design. Print. Sell. Your creativity, our platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/marketplace" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Marketplace</Link>
              <Link href="/create" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Create Design</Link>
              <Link href="/signup" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Start Selling</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Support</h4>
            <div className="space-y-2">
              <span className="block text-sm text-[var(--text-secondary)]">Help Center</span>
              <span className="block text-sm text-[var(--text-secondary)]">Size Guide</span>
              <span className="block text-sm text-[var(--text-secondary)]">Shipping Info</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Legal</h4>
            <div className="space-y-2">
              <span className="block text-sm text-[var(--text-secondary)]">Terms of Service</span>
              <span className="block text-sm text-[var(--text-secondary)]">Privacy Policy</span>
              <span className="block text-sm text-[var(--text-secondary)]">Creator Agreement</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} PrintPod. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--text-muted)]">Built for creators</span>
            <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            <span className="text-xs text-[var(--text-muted)]">Powered by passion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
