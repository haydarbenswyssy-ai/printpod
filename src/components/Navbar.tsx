'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Store, Plus, Package } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/create', label: 'Create', accent: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] backdrop-blur-xl bg-[var(--bg-primary)]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-sm flex items-center justify-center transition-transform group-hover:rotate-6">
              <span className="text-black font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>P</span>
            </div>
            <span className="text-xl tracking-tight font-semibold">
              PRINT<span className="text-[var(--accent)]">POD</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  pathname === link.href
                    ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
                    : link.accent
                    ? 'text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {link.accent && <Plus className="inline w-4 h-4 mr-1 -mt-0.5" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <span className="text-black text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">{user.name}</span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-[var(--border)]">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          href={`/store/${user.username}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          <Store className="w-4 h-4" /> My Store
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          <Package className="w-4 h-4" /> Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--accent)] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="p-1 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]">
          <div className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm rounded-lg text-[var(--text-secondary)]">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm rounded-lg bg-[var(--accent)] text-black font-medium text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
