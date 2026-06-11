'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loader2, Send, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await api.getMessages();
      setMessages(data.messages);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [user, router, load]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length !== countRef.current) {
      countRef.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api.sendMessage(body);
      setText('');
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
          SUPPORT CHAT
        </h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          Talk directly with the PrintPod team — questions, design reviews, order help.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      {/* Thread */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-4" style={{ maxHeight: '55vh', minHeight: '300px' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No messages yet.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Send a message below and the team will reply here.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.sender_role === 'user'
                    ? 'bg-[var(--accent)] text-black rounded-br-md'
                    : 'bg-[var(--bg-elevated)] border border-[var(--border)] rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-[10px] mt-1 ${m.sender_role === 'user' ? 'text-black/50' : 'text-[var(--text-muted)]'}`}>
                  {m.sender_role === 'admin' && 'PrintPod Team · '}
                  {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Write a message..."
          maxLength={2000}
          className="flex-1 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="px-5 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
