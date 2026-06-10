'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  printing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.getOrders()
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {search.get('placed') && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          <div>
            <p className="font-medium text-sm">Order placed successfully!</p>
            <p className="text-xs text-[var(--text-muted)]">You'll receive updates as we process your order.</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
        YOUR ORDERS
      </h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <Package className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-muted)]">No orders yet</p>
          <Link href="/marketplace" className="text-[var(--accent)] hover:underline text-sm mt-2 inline-block">Browse marketplace</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${item.product?.tshirt_color === 'black' ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'}`}>
                      <svg viewBox="0 0 200 220" className="w-6 h-6 opacity-30">
                        <path d="M60,10 L30,30 L10,70 L35,80 L45,50 L45,210 L155,210 L155,50 L165,80 L190,70 L170,30 L140,10 L120,20 C110,28 90,28 80,20 Z" fill={item.product?.tshirt_color === 'black' ? '#2a2a2a' : '#e0e0e0'} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.product?.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">Size {item.size} · qty {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Total ({order.payment_method.toUpperCase()})</span>
                <span className="font-bold">{formatPrice(parseFloat(order.total_amount))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
