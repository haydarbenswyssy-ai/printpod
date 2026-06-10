'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Loader2, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { SIZES } from '@/lib/constants';
import { formatPrice } from '@/lib/currency';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.getProduct(id)
      .then((data) => setProduct(data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      product_id: product.id,
      product,
      size: selectedSize,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--text-muted)]">Product not found</p>
        <Link href="/marketplace" className="text-[var(--accent)] hover:underline text-sm">Back to marketplace</Link>
      </div>
    );
  }

  const previewUrl = activeSide === 'front' ? product.preview_front_url : product.preview_back_url;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product image */}
        <div className="space-y-4">
          <div className={`relative aspect-square rounded-2xl overflow-hidden border border-[var(--border)] ${product.tshirt_color === 'black' ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'}`}>
            <svg viewBox="0 0 200 220" className="absolute inset-0 w-full h-full p-12 opacity-20">
              <path
                d="M60,10 L30,30 L10,70 L35,80 L45,50 L45,210 L155,210 L155,50 L165,80 L190,70 L170,30 L140,10 L120,20 C110,28 90,28 80,20 Z"
                fill={product.tshirt_color === 'black' ? '#2a2a2a' : '#e0e0e0'}
              />
            </svg>
            {previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center design-protected">
                <img
                  src={previewUrl}
                  alt=""
                  className="w-[40%] h-auto object-contain no-download"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            )}
          </div>

          {/* Side toggle */}
          {(product.preview_front_url || product.preview_back_url) && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSide('front')}
                className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${activeSide === 'front' ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'}`}
              >
                Front
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${activeSide === 'back' ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'}`}
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-[var(--accent-dim)] text-[var(--accent)] rounded-md mb-3">
              {product.category || 'Design'}
            </span>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            {product.seller && (
              <Link
                href={`/store/${product.seller.username}`}
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <Store className="w-4 h-4" />
                {product.seller.name} (@{product.seller.username})
              </Link>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.selling_price)}</span>
            <span className="text-sm text-[var(--text-muted)]">
              {product.tshirt_color === 'black' ? 'Black' : 'White'} T-Shirt
            </span>
          </div>

          {product.description && (
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selector */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Size</label>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || SIZES).map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-[var(--success)] text-black'
                : 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] glow-accent'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {added ? 'Added to Cart!' : 'Add to Cart'}
          </button>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
