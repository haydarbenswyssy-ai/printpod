'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { ShippingAddress } from '@/lib/types';
import { formatPrice } from '@/lib/currency';

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [step, setStep] = useState<'cart' | 'shipping' | 'confirm'>('cart');
  const [placing, setPlacing] = useState(false);
  const [shipping, setShipping] = useState<ShippingAddress>({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', zip_code: '', country: 'US',
  });

  async function placeOrder() {
    if (!user) { router.push('/login'); return; }
    setPlacing(true);
    try {
      await api.createOrder({
        items: items.map((i) => ({ product_id: i.product_id, size: i.size, quantity: i.quantity })),
        shipping,
        payment_method: 'cod',
      });
      clearCart();
      router.push('/orders?placed=1');
    } catch (err: any) {
      alert(err.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 page-enter">
        <ShoppingBag className="w-12 h-12 text-[var(--text-muted)]" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/marketplace" className="text-[var(--accent)] hover:underline text-sm">Browse marketplace</Link>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
        {step === 'cart' ? 'YOUR CART' : step === 'shipping' ? 'SHIPPING' : 'CONFIRM ORDER'}
      </h1>

      {step === 'cart' && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}`} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center ${item.product.tshirt_color === 'black' ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'}`}>
                <svg viewBox="0 0 200 220" className="w-14 h-14 opacity-30">
                  <path d="M60,10 L30,30 L10,70 L35,80 L45,50 L45,210 L155,210 L155,50 L165,80 L190,70 L170,30 L140,10 L120,20 C110,28 90,28 80,20 Z" fill={item.product.tshirt_color === 'black' ? '#2a2a2a' : '#e0e0e0'} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{item.product.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">Size: {item.size} · {item.product.tshirt_color}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-[var(--border)] rounded-lg">
                    <button onClick={() => updateQuantity(item.product_id, item.size, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-[var(--bg-tertiary)]">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)} className="p-1.5 hover:bg-[var(--bg-tertiary)]">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id, item.size)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.product.selling_price * item.quantity)}</p>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatPrice(total())}</span>
          </div>

          <button
            onClick={() => user ? setStep('shipping') : router.push('/login')}
            className="w-full py-4 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2"
          >
            Proceed to Shipping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
            {(['full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'zip_code'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  {field.replace(/_/g, ' ')}{field !== 'address_line2' && ' *'}
                </label>
                <input
                  type="text"
                  required={field !== 'address_line2'}
                  value={shipping[field]}
                  onChange={(e) => setShipping({ ...shipping, [field]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('cart')} className="flex-1 py-3 border border-[var(--border)] rounded-xl text-sm hover:bg-[var(--bg-tertiary)]">
              ← Back
            </button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!shipping.full_name || !shipping.phone || !shipping.address_line1 || !shipping.city || !shipping.state || !shipping.zip_code}
              className="flex-1 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              Review Order →
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h3 className="font-medium mb-3">Order Summary</h3>
            {items.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="flex justify-between py-2 text-sm border-b border-[var(--border)] last:border-0">
                <span>{item.product.title} ({item.size}) × {item.quantity}</span>
                <span>{formatPrice(item.product.selling_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-bold">
              <span>Total</span>
              <span>{formatPrice(total())}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h3 className="font-medium mb-2">Shipping To</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {shipping.full_name}<br />
              {shipping.address_line1}{shipping.address_line2 && `, ${shipping.address_line2}`}<br />
              {shipping.city}, {shipping.state} {shipping.zip_code}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-sm text-[var(--accent)]">
            Payment: Cash on Delivery (COD)
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('shipping')} className="flex-1 py-3 border border-[var(--border)] rounded-xl text-sm hover:bg-[var(--bg-tertiary)]">
              ← Back
            </button>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="flex-1 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
