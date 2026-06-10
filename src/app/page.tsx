'use client';

import Link from 'next/link';
import { ArrowRight, Palette, DollarSign, Truck, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--accent)] rounded-full blur-[200px] opacity-[0.04]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-[var(--accent)] bg-[var(--accent-dim)] rounded-full border border-[var(--accent)]/20">
                  <Zap className="w-3 h-3" /> Now in Beta — Start Creating Free
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.02em' }}
              >
                YOUR ART.
                <br />
                <span className="text-[var(--accent)]">YOUR BRAND.</span>
                <br />
                YOUR PROFIT.
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
                Design custom t-shirts, open your store, and earn money —
                we handle printing, shipping, and everything in between.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all glow-accent"
                >
                  Start Creating <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-all text-[var(--text-secondary)]"
                >
                  Browse Marketplace
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-2xl font-bold">0 TND</p>
                  <p className="text-xs text-[var(--text-muted)]">Upfront Cost</p>
                </div>
                <div className="w-px h-10 bg-[var(--border)]" />
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-[var(--text-muted)]">Your Profit Margin</p>
                </div>
                <div className="w-px h-10 bg-[var(--border)]" />
                <div>
                  <p className="text-2xl font-bold">2-Side</p>
                  <p className="text-xs text-[var(--text-muted)]">Print Editor</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden md:block relative"
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-[10%] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-black/50 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
                    <svg viewBox="0 0 200 220" className="w-[80%] h-[80%]">
                      <path
                        d="M60,10 L30,30 L10,70 L35,80 L45,50 L45,210 L155,210 L155,50 L165,80 L190,70 L170,30 L140,10 L120,20 C110,28 90,28 80,20 Z"
                        fill="#2a2a2a"
                        stroke="#333"
                        strokeWidth="1"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-[var(--accent)] flex items-center justify-center">
                        <span className="text-[var(--accent)] text-2xl" style={{ fontFamily: 'var(--font-bebas), sans-serif' }}>P</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-[var(--accent)] text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                  60 TND
                </div>
                <div className="absolute bottom-8 left-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                    <span className="text-xs font-medium">Made for creators</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
              HOW IT WORKS
            </h2>
            <p className="text-[var(--text-muted)]">Three steps to your own t-shirt brand</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Palette, title: 'Design', desc: 'Use our built-in editor to create your design. Upload artwork or add custom text to white or black tees.', step: '01' },
              { icon: DollarSign, title: 'Set Your Price', desc: 'Choose your selling price above the base cost. The difference is your profit per sale.', step: '02' },
              { icon: Truck, title: 'We Handle The Rest', desc: 'We print, pack, and ship every order. You focus on creating and promoting your brand.', step: '03' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-300"
              >
                <span className="absolute top-6 right-6 text-5xl font-bold text-[var(--bg-tertiary)] group-hover:text-[var(--accent-dim)] transition-colors" style={{ fontFamily: 'var(--font-bebas), sans-serif' }}>
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[var(--border)] bg-[var(--bg-secondary)] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] rounded-full blur-[300px] opacity-[0.03]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl sm:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.02em' }}>
              READY TO <span className="text-[var(--accent)]">CREATE</span>?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Join thousands of creators turning their art into wearable products.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-black font-bold rounded-xl text-lg hover:bg-[var(--accent-hover)] transition-all glow-accent">
              Open Your Store <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
