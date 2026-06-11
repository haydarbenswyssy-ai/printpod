'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Plus, Loader2, Package, TrendingUp, Eye, Store, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadProducts();
  }, [user, router]);

  async function loadProducts() {
    if (!user) return;
    try {
      // Get all products by this seller (any status)
      const params = new URLSearchParams({ seller_id: user.id });
      // Use the regular endpoint with all statuses by fetching each
      const all = await Promise.all(
        ['pending', 'approved', 'rejected', 'draft'].map((status) =>
          fetch(`/api/products?status=${status}&seller_id=${user.id}`).then((r) => r.json())
        )
      );
      const merged = all.flatMap((d) => d.products || []);
      setProducts(merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const approved = products.filter((p) => p.status === 'approved');
  const pending = products.filter((p) => p.status === 'pending');
  const totalProfit = approved.reduce((sum, p) => sum + parseFloat(p.profit), 0);

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {search.get('created') && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          <div>
            <p className="font-medium text-sm">Product submitted!</p>
            <p className="text-xs text-[var(--text-muted)]">It will appear in your store after admin approval.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
            CREATOR DASHBOARD
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your designs and track your store</p>
        </div>
        <Link href="/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] text-sm">
          <Plus className="w-4 h-4" /> New Design
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Package} label="Total Products" value={products.length} />
        <StatCard icon={Eye} label="Live" value={approved.length} accent />
        <StatCard icon={Loader2} label="In Review" value={pending.length} />
        <StatCard icon={TrendingUp} label="Potential Profit" value={formatPrice(totalProfit)} />
      </div>

      {/* Store link */}
      {user && (
        <Link
          href={`/store/${user.username}`}
          className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 mb-8 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-medium">Your public store</p>
              <p className="text-xs text-[var(--text-muted)]">printpod.com/store/{user.username}</p>
            </div>
          </div>
          <span className="text-xs text-[var(--accent)]">View →</span>
        </Link>
      )}

      {/* Products */}
      <h2 className="text-lg font-semibold mb-4">Your Designs</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--text-muted)] mb-3">No designs yet</p>
          <Link href="/create" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-black rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> Create your first design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                <div className="absolute inset-0 flex items-center justify-center design-protected">
                  <img src={product.preview_front_url || '/tshirt/front.png'} alt={product.title} className="w-full h-full object-contain no-download" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-md border ${STATUS_BADGE[product.status]}`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium truncate">{product.title}</h3>
                <div className="flex justify-between items-center text-xs mt-0.5">
                  <span className="text-[var(--text-muted)]">{formatPrice(product.selling_price)}</span>
                  <span className="text-[var(--success)]">+{formatPrice(parseFloat(product.profit))} profit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: any; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl bg-[var(--bg-card)] border ${accent ? 'border-[var(--accent)]/30' : 'border-[var(--border)]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
