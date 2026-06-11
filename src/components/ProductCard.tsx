'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/currency';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-[var(--border)] transition-all duration-300 group-hover:border-[var(--border-hover)] group-hover:shadow-lg group-hover:shadow-black/20">
        {/* Preview already has the design composited onto the tee */}
        <div className="absolute inset-0 flex items-center justify-center design-protected">
          <img
            src={product.preview_front_url || `/tshirt/front.png`}
            alt={product.title}
            className="w-full h-full object-contain no-download"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-[var(--accent)] text-black rounded-md">
            {product.category || 'Design'}
          </span>
        </div>

        {/* Status badge */}
        {product.status === 'pending' && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium bg-yellow-500/20 text-yellow-400 rounded-md border border-yellow-500/30">
              Pending
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            {product.seller?.name || 'Unknown Creator'}
          </p>
          <p className="text-sm font-semibold">{formatPrice(product.selling_price)}</p>
        </div>
      </div>
    </Link>
  );
}
