'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { User, Product } from '@/lib/types';
import { Loader2, Calendar, Package } from 'lucide-react';

export default function StorePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [store, setStore] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStore(username)
      .then((data) => {
        setStore(data.store);
        setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Store not found</p>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] overflow-hidden">
        {store.store_banner && (
          <img src={store.store_banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 grid-bg" />
      </div>

      {/* Store info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-24 h-24 rounded-2xl bg-[var(--accent)] flex items-center justify-center border-4 border-[var(--bg-primary)] shadow-xl">
            <span className="text-black text-3xl font-bold">{store.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="pt-2">
            <h1 className="text-2xl font-bold">{store.store_name || store.name}</h1>
            <p className="text-[var(--text-muted)] text-sm">@{store.username}</p>
            {store.bio && <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg">{store.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {products.length} products</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-lg font-semibold mb-4">Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
