'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Users, Package, ShoppingBag, Clock, Check, X, Loader2, Banknote, Trash2, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

type Tab = 'overview' | 'products' | 'orders' | 'users' | 'messages';
const ORDER_FLOW = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>('pending');

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeThreadUser, setActiveThreadUser] = useState<any>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
    loadData();
  }, [user, tab, productFilter, router]);

  // Poll the open chat thread for new messages
  useEffect(() => {
    if (tab !== 'messages' || !activeThreadUser) return;
    const load = async () => {
      try {
        const data = await api.adminGetThread(activeThreadUser.user_id);
        setThread(data.messages);
      } catch { /* keep last state */ }
    };
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [tab, activeThreadUser]);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      if (tab === 'overview') {
        const data = await api.adminGetStats();
        setStats(data.stats);
      } else if (tab === 'products') {
        const data = await api.adminGetProducts(productFilter);
        setProducts(data.products);
      } else if (tab === 'orders') {
        const data = await api.adminGetOrders();
        setOrders(data.orders);
      } else if (tab === 'users') {
        const data = await api.adminGetUsers();
        setUsers(data.users);
      } else if (tab === 'messages') {
        const data = await api.adminGetConversations();
        setConversations(data.conversations);
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load data. Try signing out and back in.');
    } finally {
      setLoading(false);
    }
  }

  async function updateProductStatus(id: string, status: string) {
    await api.adminUpdateProduct(id, { status });
    loadData();
  }

  async function updateOrderStatus(id: string, status: string) {
    await api.adminUpdateOrder(id, { status });
    loadData();
  }

  async function deleteProduct(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.unlisted) alert(res.message);
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
    loadData();
  }

  async function sendReply() {
    const body = replyText.trim();
    if (!body || !activeThreadUser || replySending) return;
    setReplySending(true);
    try {
      await api.adminReply(activeThreadUser.user_id, body);
      setReplyText('');
      const data = await api.adminGetThread(activeThreadUser.user_id);
      setThread(data.messages);
    } catch (err: any) {
      alert(err?.message || 'Failed to send');
    } finally {
      setReplySending(false);
    }
  }

  if (!user || user.role !== 'admin') return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Banknote },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
          ADMIN CONTROL
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Manage everything in PrintPod</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <AdminStat icon={Users} label="Total Users" value={stats.totalUsers} />
              <AdminStat icon={Package} label="Total Products" value={stats.totalProducts} />
              <AdminStat icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} />
              <AdminStat icon={Clock} label="Pending Reviews" value={stats.pendingApprovals} accent />
              <AdminStat icon={Banknote} label="Total Revenue" value={formatPrice(parseFloat(stats.totalRevenue))} />
            </div>
          )}

          {/* Products */}
          {tab === 'products' && (
            <div>
              <div className="flex gap-2 mb-4">
                {['pending', 'approved', 'rejected', 'draft'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setProductFilter(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      productFilter === s ? 'bg-[var(--accent)] text-black font-medium' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] text-sm text-[var(--text-muted)]">
                  No {productFilter} products
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p.id} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                      <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center bg-white overflow-hidden">
                        {p.preview_front_url ? (
                          <img src={p.preview_front_url} alt="" className="w-full h-full object-contain no-download" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                        ) : (
                          <img src="/tshirt/front.png" alt="" className="w-full h-full object-contain opacity-60" draggable={false} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{p.title}</h3>
                        <p className="text-xs text-[var(--text-muted)]">by @{p.seller?.username}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{p.category} · {formatPrice(p.selling_price)} · {p.tshirt_color}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateProductStatus(p.id, 'approved')}
                              className="p-2 bg-[var(--success)]/10 text-[var(--success)] rounded-lg hover:bg-[var(--success)]/20 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateProductStatus(p.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {p.status === 'rejected' && (
                          <button
                            onClick={() => updateProductStatus(p.id, 'approved')}
                            className="px-3 py-1.5 text-xs bg-[var(--success)]/10 text-[var(--success)] rounded-lg"
                          >
                            Restore
                          </button>
                        )}
                        {p.status === 'approved' && (
                          <button
                            onClick={() => updateProductStatus(p.id, 'rejected')}
                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg"
                          >
                            Unlist
                          </button>
                        )}
                        <button
                          onClick={() => deleteProduct(p.id, p.title)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] text-sm text-[var(--text-muted)]">No orders yet</div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => {
                    const currentStep = ORDER_FLOW.indexOf(o.status);
                    return (
                      <div key={o.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-[var(--text-muted)]">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</p>
                            <p className="text-sm mt-0.5">{o.customer?.name} ({o.customer?.email})</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {o.shipping_address1}, {o.shipping_city}, {o.shipping_state} {o.shipping_zip}
                            </p>
                          </div>
                          <p className="font-bold">{formatPrice(parseFloat(o.total_amount))}</p>
                        </div>

                        {/* Items with download for production */}
                        <div className="space-y-2 mb-4">
                          {o.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-[var(--bg-primary)]">
                              <div className="flex-1">
                                <p>{item.product?.title} ({item.size}) × {item.quantity}</p>
                              </div>
                              <div className="flex gap-1">
                                {item.design_front_url && (
                                  <a href={item.design_front_url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] rounded">
                                    Front
                                  </a>
                                )}
                                {item.design_back_url && (
                                  <a href={item.design_back_url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] rounded">
                                    Back
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Production status flow */}
                        <div className="flex items-center gap-2 mb-3">
                          {ORDER_FLOW.map((s, i) => (
                            <div key={s} className="flex items-center gap-2 flex-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                i <= currentStep ? 'bg-[var(--accent)] text-black' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                              }`}>
                                {i + 1}
                              </div>
                              {i < ORDER_FLOW.length - 1 && <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'}`} />}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg"
                          >
                            {[...ORDER_FLOW, 'cancelled'].map((s) => (
                              <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{u.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{u.email} · @{u.username}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-md border ${
                    u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    u.role === 'seller' ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]/20' :
                    'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {tab === 'messages' && (
            <div>
              {!activeThreadUser ? (
                /* Conversation list */
                conversations.length === 0 ? (
                  <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                    <MessageCircle className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">No conversations yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">When sellers message you, they appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((c) => (
                      <button
                        key={c.user_id}
                        onClick={() => { setActiveThreadUser(c); setThread([]); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-bold text-sm">{c.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{c.user?.name} <span className="text-[var(--text-muted)] font-normal">@{c.user?.username}</span></p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {c.last_sender === 'admin' && 'You: '}{c.last_message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(c.last_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          {c.unread > 0 && (
                            <span className="w-5 h-5 bg-[var(--accent)] text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Open thread */
                <div>
                  <button
                    onClick={() => { setActiveThreadUser(null); loadData(); }}
                    className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> All conversations
                  </button>

                  <div className="flex items-center gap-3 p-3 rounded-t-2xl bg-[var(--bg-elevated)] border border-[var(--border)] border-b-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <span className="text-black font-bold text-xs">{activeThreadUser.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activeThreadUser.user?.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">@{activeThreadUser.user?.username} · {activeThreadUser.user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] overflow-y-auto" style={{ maxHeight: '50vh', minHeight: '250px' }}>
                    {thread.length === 0 ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" /></div>
                    ) : (
                      thread.map((m) => (
                        <div key={m.id} className={`flex ${m.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            m.sender_role === 'admin'
                              ? 'bg-[var(--accent)] text-black rounded-br-md'
                              : 'bg-[var(--bg-elevated)] border border-[var(--border)] rounded-bl-md'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <p className={`text-[10px] mt-1 ${m.sender_role === 'admin' ? 'text-black/50' : 'text-[var(--text-muted)]'}`}>
                              {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 p-3 rounded-b-2xl bg-[var(--bg-elevated)] border border-[var(--border)] border-t-0">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                      placeholder="Reply..."
                      maxLength={2000}
                      className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim() || replySending}
                      className="px-4 py-2.5 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all disabled:opacity-40"
                    >
                      {replySending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: any; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl bg-[var(--bg-card)] border ${accent ? 'border-[var(--accent)]/30 bg-[var(--accent-dim)]' : 'border-[var(--border)]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
