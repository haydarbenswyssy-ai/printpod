'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await api.signup(form);
      setAuth(user, token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
            JOIN PRINTPOD
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Start designing and selling in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
