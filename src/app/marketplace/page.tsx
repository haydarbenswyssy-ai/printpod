'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category]);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const data = await api.getProducts(params.toString());
      setProducts(data.products);
    } catch {
      // Products will remain empty on error
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadProducts();
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
            MARKETPLACE
          </h1>
          <p className="text-[var(--text-muted)]">Discover unique designs from independent creators</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search designs..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </form>

          {/* Category filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  !category ? 'bg-[var(--accent)] text-black font-medium' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    category === cat ? 'bg-[var(--accent)] text-black font-medium' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {category && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Filtered by:</span>
              <button
                onClick={() => setCategory('')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[var(--accent-dim)] text-[var(--accent)] rounded-lg"
              >
                {category} <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-[var(--bg-card)]" />
                <div className="mt-3 h-4 bg-[var(--bg-card)] rounded w-3/4" />
                <div className="mt-2 h-3 bg-[var(--bg-card)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] text-lg">No products found</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Try adjusting your search or filters</p>
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
