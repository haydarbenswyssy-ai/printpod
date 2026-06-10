'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X, Crown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function DevBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user, token, setAuth, updateUser } = useAuthStore();

  useEffect(() => {
    fetch('/api/dev-status')
      .then((r) => r.json())
      .then((d) => setShow(d.devMode))
      .catch(() => {});
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem('dev-banner-dismissed') === '1');
    }
  }, []);

  async function becomeAdmin() {
    if (!token) {
      alert('Please sign up first');
      return;
    }
    const res = await fetch('/api/dev-make-admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setAuth(data.user, data.token);
      alert('You are now an admin! Refresh to see the Admin Panel link.');
      window.location.reload();
    } else {
      alert(data.message || 'Failed');
    }
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-xl shadow-2xl">
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('dev-banner-dismissed', '1');
        }}
        className="absolute top-2 right-2 p-1 rounded hover:bg-yellow-500/20"
      >
        <X className="w-3 h-3 text-yellow-400" />
      </button>
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-yellow-400 mb-1">Dev Mode Active</p>
          <p className="text-xs text-yellow-200/80 leading-relaxed">
            Using in-memory database. Data resets when the server restarts.
          </p>
        </div>
      </div>
      {user && user.role !== 'admin' && (
        <button
          onClick={becomeAdmin}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors"
        >
          <Crown className="w-3 h-3" /> Make me admin
        </button>
      )}
    </div>
  );
}
