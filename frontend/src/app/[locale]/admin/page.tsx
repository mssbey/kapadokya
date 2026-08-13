'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/components/I18nProvider';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AvailabilityBoard } from '@/components/admin/AvailabilityBoard';
import { GapsPanel } from '@/components/admin/GapsPanel';
import { TourEditor } from '@/components/admin/TourEditor';
import { BookingsManager } from '@/components/admin/BookingsManager';
import { PromoManager } from '@/components/admin/PromoManager';
import { LegalPagesManager } from '@/components/admin/LegalPagesManager';
import { api } from '@/lib/api';
import { formatPrice, cn, getStatusColor, getCategoryLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  BarChart3, Users, Calendar, DollarSign, TrendingUp, MapPin,
  Package, ChevronRight, ChevronLeft, Eye, EyeOff, Edit2, Trash2,
  Plus, Loader2, CreditCard, Check, ExternalLink,
  CheckCircle, XCircle, Clock, AlertTriangle, LogOut, X, RefreshCw, Tag, Search, FileText
} from 'lucide-react';

type Tab = 'dashboard' | 'tours' | 'bookings' | 'payments' | 'availability' | 'customers' | 'promos' | 'revenue' | 'legal';

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
    </div>
  );
}

function LegacyPromoCodesTab() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: 10, maxUses: '' });

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try { const response = await api.get('/admin/promo-codes'); setCodes(response.data.data); }
    catch (error: any) { toast.error(extractError(error, 'Failed to load promo codes.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  async function createCode(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.post('/admin/promo-codes', { code: form.code, type: form.type, value: Number(form.value), maxUses: form.maxUses ? Number(form.maxUses) : null });
      toast.success('Promo code created');
      setForm({ code: '', type: 'PERCENT', value: 10, maxUses: '' });
      loadCodes();
    } catch (error: any) { toast.error(extractError(error, 'Promo code could not be created.')); }
  }

  async function toggleCode(code: any) {
    try { await api.patch(`/admin/promo-codes/${code.id}`, { isActive: !code.isActive }); loadCodes(); }
    catch (error: any) { toast.error(extractError(error, 'Promo code could not be updated.')); }
  }

  return <div><h1 className="mb-8 font-display text-3xl font-bold">Promo Codes</h1><form onSubmit={createCode} className="glass-card mb-8 grid gap-4 p-6 md:grid-cols-5"><div><label className="mb-2 block text-xs text-gray-500">Code</label><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-glass uppercase" placeholder="SUMMER10" /></div><div><label className="mb-2 block text-xs text-gray-500">Discount type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-glass"><option value="PERCENT">Percent</option><option value="FIXED">Fixed EUR</option></select></div><div><label className="mb-2 block text-xs text-gray-500">Value</label><input required min="0.01" step="0.01" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="input-glass" /></div><div><label className="mb-2 block text-xs text-gray-500">Maximum uses</label><input min="1" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input-glass" placeholder="Unlimited" /></div><button className="btn-primary self-end !px-4 !py-3">Create code</button></form>{loading ? <LoadingBlock /> : <div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-white/10"><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Usage</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead><tbody>{codes.map((code) => <tr key={code.id} className="border-b border-gray-100 text-sm dark:border-white/5"><td className="p-4 font-mono font-bold">{code.code}</td><td className="p-4">{code.type === 'PERCENT' ? `${code.value}%` : formatPrice(code.value, 'EUR')}</td><td className="p-4">{code.usedCount}{code.maxUses ? ` / ${code.maxUses}` : ''}</td><td className="p-4">{code.isActive ? 'Active' : 'Disabled'}</td><td className="p-4 text-right"><button onClick={() => toggleCode(code)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-white/10">{code.isActive ? 'Disable' : 'Enable'}</button></td></tr>)}</tbody></table></div>{codes.length === 0 && <p className="p-8 text-center text-sm text-gray-400">No promo codes yet.</p>}</div>}</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-gray-500 dark:text-white/60 text-sm max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/5">
      <span className="text-xs text-gray-400 dark:text-white/40">
        Page {page} of {pages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user, logout, loadUser } = useAuthStore();
  // Locale-aware so an admin working in /tr is not bounced into /en on sign-out.
  const { href, locale } = useI18n();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    let active = true;
    loadUser().finally(() => { if (active) setCheckedAuth(true); });
    return () => { active = false; };
  }, [loadUser]);

  const tr = locale === 'tr';
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: tr ? 'Genel Bakış' : 'Dashboard', icon: BarChart3 },
    { id: 'tours', label: tr ? 'Turlar' : 'Tours', icon: MapPin },
    { id: 'bookings', label: tr ? 'Rezervasyonlar' : 'Bookings', icon: Calendar },
    { id: 'payments', label: tr ? 'Ödemeler' : 'Payments', icon: CreditCard },
    { id: 'availability', label: tr ? 'Müsaitlik' : 'Availability', icon: Package },
    { id: 'customers', label: tr ? 'Müşteriler' : 'Customers', icon: Users },
    { id: 'promos', label: tr ? 'Promosyonlar' : 'Promo Codes', icon: Tag },
    { id: 'revenue', label: tr ? 'Gelir' : 'Revenue', icon: DollarSign },
    { id: 'legal', label: tr ? 'Yasal Sayfalar' : 'Legal Pages', icon: FileText },
  ];

  if (!checkedAuth) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Sign-in happens on /admin itself rather than by bouncing to the customer
  // login page — the URL an admin bookmarks is the one that should let them in.
  if (!user) return <AdminLogin />;
  if (user.role !== 'ADMIN') return <AdminLogin signedInAsNonAdmin={user.email} />;

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-5rem)] bg-white dark:bg-dark-50 border-r border-gray-200 dark:border-white/5 p-4 relative">
          <div className="mb-8 px-3">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{tr ? 'Yönetim Paneli' : 'Admin Panel'}</h2>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1 truncate" title={user.email}>{user.email}</p>
            <Link
              href={href('/')}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {tr ? 'Siteyi görüntüle' : 'View site'}
            </Link>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {tr ? 'Çıkış yap' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Mobile Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-50/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all flex-shrink-0',
                  activeTab === tab.id
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-gray-400 dark:text-white/40'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-20 lg:pb-8 min-w-0">
          {activeTab === 'dashboard' && <DashboardTab onOpenAvailability={() => setActiveTab('availability')} />}
          {activeTab === 'tours' && <ToursTab />}
          {activeTab === 'bookings' && <BookingsManager />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'availability' && <AvailabilityBoard />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'promos' && <PromoManager />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'legal' && <LegalPagesManager />}
        </main>
      </div>
    </div>
  );
}

// =================== DASHBOARD ===================

function DashboardTab({ onOpenAvailability }: { onOpenAvailability: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, revRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics/revenue', { params: { days: 30 } }),
      ]);
      setStats(dashRes.data.data);
      setCategoryRevenue(revRes.data.data.categoryRevenue || {});
    } catch (err: any) {
      setError(extractError(err, 'Failed to load dashboard stats.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={fetchAll} />;

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign },
    { label: 'Month Revenue', value: formatPrice(stats?.monthRevenue || 0), icon: TrendingUp },
    { label: 'Today Bookings', value: stats?.todayBookings?.toLocaleString() || '0', icon: Calendar },
    { label: 'Pending Bookings', value: stats?.pendingBookings?.toLocaleString() || '0', icon: Clock },
    { label: 'Upcoming Bookings', value: stats?.upcomingBookings?.toLocaleString() || '0', icon: Calendar },
    { label: 'Completed Payments', value: stats?.completedPayments?.toLocaleString() || '0', icon: CreditCard },
    { label: 'Active Tours', value: stats?.activeTours?.toLocaleString() || '0', icon: MapPin },
    { label: 'Total Customers', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users },
  ];

  const categoryTotal = Object.values(categoryRevenue).reduce((sum: number, v: any) => sum + v, 0) || 1;
  const categoryEntries = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <GapsPanel onOpenAvailability={onOpenAvailability} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">Today Revenue</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatPrice(stats?.todayRevenue || 0)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">Confirmed / Cancelled</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats?.confirmedBookings} / {stats?.cancelledBookings}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">This Month Bookings</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats?.monthBookings}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 dark:text-white/50">30d low / sold out / missing</span>
              <span className="font-medium text-amber-500">{stats?.lowCapacityDates} / {stats?.soldOutDates} / {stats?.missingAvailabilityDates}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category (30d)</h3>
          {categoryEntries.length === 0 ? (
            <p className="text-gray-400 dark:text-white/40 text-sm">No completed payments in this period.</p>
          ) : (
            <div className="space-y-3">
              {categoryEntries.map(([cat, revenue]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-white/60">{getCategoryLabel(cat)}</span>
                    <span className="text-gray-700 dark:text-white/80">{formatPrice(revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(revenue / categoryTotal) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6"><h3 className="mb-4 font-semibold">Recent bookings</h3><div className="space-y-3">{stats?.recentBookings?.map((booking: any) => <div key={booking.id} className="flex justify-between border-b py-2 text-sm dark:border-white/5"><div><b>{booking.bookingNumber}</b><p className="text-gray-500">{booking.guestName} · {booking.tour?.title}</p></div><div className="text-right"><span>{booking.status}</span><p>{formatPrice(booking.totalPrice, booking.currency)}</p></div></div>)}</div></div>
        <div className="glass-card p-6"><h3 className="mb-4 font-semibold">Best-selling tours</h3><div className="space-y-3">{stats?.topTours?.map((tour: any) => <div key={tour.tourId} className="flex justify-between border-b py-2 text-sm dark:border-white/5"><span>{tour.title}</span><span>{tour.bookings} bookings · {formatPrice(tour.revenue)}</span></div>)}</div></div>
      </div>
    </div>
  );
}

// =================== TOURS ===================

const emptyTourForm = {
  title: '',
  slug: '',
  description: '',
  shortDesc: '',
  category: 'DAILY_TOUR',
  basePrice: 0,
  currency: 'USD',
  duration: '',
  maxCapacity: 10,
  images: '',
  videoUrl: '',
  highlights: '',
  includes: '',
  excludes: '',
  isActive: true,
  sortOrder: 0,
};

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

function LegacyTourFormModal({
  tour,
  onClose,
  onSaved,
}: {
  tour: any | null;
  onClose: () => void;
  onSaved: (tour: any) => void;
}) {
  const [form, setForm] = useState(() =>
    tour
      ? {
          title: tour.title || '',
          slug: tour.slug || '',
          description: tour.description || '',
          shortDesc: tour.shortDesc || '',
          category: tour.category || 'DAILY_TOUR',
          basePrice: tour.basePrice ?? 0,
          currency: tour.currency || 'USD',
          duration: tour.duration || '',
          maxCapacity: tour.maxCapacity ?? 10,
          images: (tour.images || []).join('\n'),
          videoUrl: tour.videoUrl || '',
          highlights: (tour.highlights || []).join('\n'),
          includes: (tour.includes || []).join('\n'),
          excludes: (tour.excludes || []).join('\n'),
          isActive: tour.isActive ?? true,
          sortOrder: tour.sortOrder ?? 0,
        }
      : emptyTourForm
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        shortDesc: form.shortDesc,
        category: form.category,
        basePrice: Number(form.basePrice),
        currency: form.currency,
        duration: form.duration,
        maxCapacity: Number(form.maxCapacity),
        images: linesToArray(form.images),
        videoUrl: form.videoUrl || undefined,
        highlights: linesToArray(form.highlights),
        includes: linesToArray(form.includes),
        excludes: linesToArray(form.excludes),
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
      };

      const res = tour
        ? await api.put(`/admin/tours/${tour.id}`, payload)
        : await api.post('/admin/tours', payload);

      toast.success(tour ? 'Tour updated' : 'Tour created');
      onSaved(res.data.data);
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to save tour'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-dark-50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            {tour ? 'Edit Tour' : 'Add Tour'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Title</label>
              <input required className="input-glass" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Slug</label>
              <input required className="input-glass" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Short Description</label>
            <input required className="input-glass" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Description</label>
            <textarea required rows={3} className="input-glass" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Category</label>
              <select className="input-glass" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="BALLOON">Balloon</option>
                <option value="DAILY_TOUR">Daily Tour</option>
                <option value="ADVENTURE">Adventure</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Base Price</label>
              <input required type="number" min={0} step="0.01" className="input-glass" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value as any })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Duration</label>
              <input required placeholder="e.g. 3 hours" className="input-glass" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Max Capacity</label>
              <input required type="number" min={1} className="input-glass" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value as any })} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Images (one URL per line)</label>
            <textarea rows={2} className="input-glass" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Highlights (one per line)</label>
              <textarea rows={3} className="input-glass" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Includes (one per line)</label>
              <textarea rows={3} className="input-glass" value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Excludes (one per line)</label>
              <textarea rows={3} className="input-glass" value={form.excludes} onChange={(e) => setForm({ ...form, excludes: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-white/60">Sort Order</label>
              <input type="number" className="input-glass w-24" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value as any })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {tour ? 'Save Changes' : 'Create Tour'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/**
 * Price editing without opening the full tour form — the common case is
 * "move this one number", and the form round-trips every other field with it.
 */
function InlinePrice({ tour, onSaved }: { tour: any; onSaved: (basePrice: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(tour.basePrice));
  const [saving, setSaving] = useState(false);

  async function save() {
    const basePrice = Number(value);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      toast.error('Price must be greater than zero.');
      return;
    }
    if (basePrice === tour.basePrice) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/admin/tours/${tour.id}/price`, { basePrice });
      onSaved(basePrice);
      toast.success(`${tour.title} — price updated`);
      setEditing(false);
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to update the price.'));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(String(tour.basePrice));
          setEditing(true);
        }}
        className="rounded-md px-1.5 py-0.5 font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-white/60 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
        title="Click to edit the price"
      >
        {formatPrice(tour.basePrice, tour.currency || 'EUR')}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-24 rounded-lg border border-emerald-400 bg-white px-2 py-1 text-sm text-gray-900 outline-none dark:bg-white/10 dark:text-white"
      />
      <button onClick={save} disabled={saving} aria-label="Save price" className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button onClick={() => setEditing(false)} aria-label="Cancel" className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
        <X className="h-4 w-4" />
      </button>
    </span>
  );
}

function ToursTab() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTour, setModalTour] = useState<any | null | 'new'>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/tours');
      setTours(res.data.data);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load tours.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const query = search.trim().toLowerCase();
  const visibleTours = query
    ? tours.filter((tour) => `${tour.title} ${tour.slug} ${tour.category}`.toLowerCase().includes(query))
    : tours;

  async function toggleTour(tourId: string) {
    const prev = tours;
    setTours((p) => p.map((t) => (t.id === tourId ? { ...t, isActive: !t.isActive } : t)));
    try {
      await api.patch(`/admin/tours/${tourId}/toggle`);
    } catch (err: any) {
      setTours(prev);
      toast.error(extractError(err, 'Failed to update tour status'));
    }
  }

  async function deleteTour(tourId: string) {
    if (!window.confirm('Delete this tour? This cannot be undone.')) return;
    setDeletingId(tourId);
    try {
      await api.delete(`/admin/tours/${tourId}`);
      setTours((p) => p.filter((t) => t.id !== tourId));
      toast.success('Tour deleted');
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to delete tour'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Tours</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            {tours.length} product{tours.length === 1 ? '' : 's'} · click a price to change it
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours"
            className="input-glass !w-52 !py-2.5"
          />
          <button onClick={() => setModalTour('new')} className="btn-primary text-sm flex items-center gap-2 !px-5 !py-2.5">
            <Plus className="w-4 h-4" />
            Add Tour
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={fetchTours} />
      ) : tours.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No tours yet. Create your first one.</p>
      ) : (
        <div className="space-y-3">
          {visibleTours.length === 0 && (
            <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No tours match “{search}”.</p>
          )}
          {visibleTours.map((tour) => (
            <div key={tour.id} className="glass-card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tour.title}</h3>
                  <span className={cn('badge text-xs', tour.isActive ? 'badge-emerald' : 'badge-red')}>
                    {tour.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 dark:text-white/40">
                  <span>{getCategoryLabel(tour.category)}</span>
                  <InlinePrice
                    tour={tour}
                    onSaved={(basePrice) =>
                      setTours((prev) => prev.map((t) => (t.id === tour.id ? { ...t, basePrice } : t)))
                    }
                  />
                  <span>{tour._count?.bookings || 0} bookings</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTour(tour.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  title={tour.isActive ? 'Deactivate' : 'Activate'}
                >
                  {tour.isActive ? (
                    <Eye className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  )}
                </button>
                <button
                  onClick={() => setModalTour(tour)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-400 dark:text-white/40" />
                </button>
                <button
                  onClick={() => deleteTour(tour.id)}
                  disabled={deletingId === tour.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  {deletingId === tour.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalTour && (
        <TourEditor
          tour={modalTour === 'new' ? null : modalTour}
          onClose={() => setModalTour(null)}
          onSaved={(saved) => {
            setTours((prev) => {
              const exists = prev.some((t) => t.id === saved.id);
              return exists ? prev.map((t) => (t.id === saved.id ? { ...t, ...saved } : t)) : [...prev, saved];
            });
            setModalTour(null);
          }}
        />
      )}
    </div>
  );
}

// =================== BOOKINGS ===================

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

function LegacyBookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit: 20, page };
      if (filter !== 'ALL') params.status = filter;
      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data.data);
      setPages(res.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load bookings.'));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  async function updateStatus(bookingId: string, status: string) {
    setUpdatingId(bookingId);
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: res.data.data.status } : b)));
      toast.success(`Booking marked ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to update booking status'));
    } finally {
      setUpdatingId(null);
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Bookings</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', ...BOOKING_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === s
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No bookings found.</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Guest</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Tour</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Date</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Guests</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Total</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Payment</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                      <div>{b.guestName || b.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-400 dark:text-white/40">{b.guestEmail || b.user?.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{b.tour?.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{b.adults + (b.children || 0)}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">{formatPrice(b.totalPrice, b.currency)}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-white/60">{b.payment?.provider || '—'}</div>
                      <div className={cn('text-xs font-medium', b.payment?.status === 'COMPLETED' ? 'text-emerald-400' : 'text-yellow-400')}>
                        {b.payment?.status || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(b.status)}
                        <span className={cn('text-xs font-medium', getStatusColor(b.status))}>{b.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="text-xs rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1.5 text-gray-700 dark:text-white/80"
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// =================== PAYMENTS ===================

function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCompleted, setTotalCompleted] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit: 20, page };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (providerFilter !== 'ALL') params.provider = providerFilter;
      const res = await api.get('/admin/payments', { params });
      setPayments(res.data.data);
      setPages(res.data.pagination?.pages || 1);
      setTotalCompleted(res.data.totalCompleted || 0);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load payments.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, providerFilter, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, providerFilter]);

  const paymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-400';
      case 'PENDING': return 'text-yellow-400';
      case 'FAILED': return 'text-red-400';
      case 'REFUNDED': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
      </div>

      <div className="glass-card p-5 mb-6 inline-block">
        <p className="text-gray-400 dark:text-white/40 text-sm">Total Completed (filtered)</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(totalCompleted)}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        {['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              statusFilter === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            )}
          >
            {s === 'ALL' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
        <span className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />
        {['ALL', 'STRIPE', 'IYZICO'].map((p) => (
          <button
            key={p}
            onClick={() => setProviderFilter(p)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              providerFilter === p
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            )}
          >
            {p === 'ALL' ? 'All Providers' : p}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={fetchPayments} />
      ) : payments.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No payments found.</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Date</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Guest</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Tour</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Amount</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Provider</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                      <div>{p.booking?.guestName || p.booking?.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-400 dark:text-white/40">{p.booking?.guestEmail || p.booking?.user?.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{p.booking?.tour?.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">{formatPrice(p.amount, p.currency)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{p.provider}</td>
                    <td className="px-5 py-4">
                      <span className={cn('text-xs font-medium', paymentStatusColor(p.status))}>{p.status}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 dark:text-white/40 font-mono">{p.providerPaymentId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// =================== CUSTOMERS ===================

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/customers', { params: { limit: 20, page, search: query || undefined } });
      setCustomers(res.data.data);
      setPages(res.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openDetail = async (email: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get('/admin/customers/detail', { params: { email } });
      setDetail(response.data.data);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load customer history.'));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Customers</h1>
      <form className="mb-5 flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <label className="relative flex-1">
          <span className="sr-only">Search customers</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-white/10 dark:bg-white/5" />
        </label>
        <button className="rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white">Search</button>
      </form>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={fetchCustomers} />
      ) : customers.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No customers found.</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Name</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Email</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Phone</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Bookings</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} onClick={() => openDetail(c.email)} className="cursor-pointer border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') openDetail(c.email); }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                          {c.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{c.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{c.phone || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">{c._count?.bookings || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-400 dark:text-white/40">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}
      {detailLoading && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>}
      {detail && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Customer detail"><div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-dark-50"><div className="flex items-start justify-between"><div><h2 className="font-display text-2xl font-bold">{detail.customer.name || detail.customer.email}</h2><p className="mt-1 text-sm text-gray-500 dark:text-white/50">{detail.customer.email}{detail.customer.phone ? ` · ${detail.customer.phone}` : ''}</p></div><button onClick={() => setDetail(null)} aria-label="Close"><X className="h-6 w-6" /></button></div><h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-gray-400">Booking history</h3><div className="mt-3 space-y-3">{detail.bookings.length === 0 ? <p className="text-sm text-gray-400">No bookings found.</p> : detail.bookings.map((booking: any) => <div key={booking.id} className="grid gap-2 rounded-2xl border p-4 text-sm dark:border-white/10 sm:grid-cols-4"><div><p className="font-bold">{booking.bookingNumber}</p><p className="text-gray-500">{booking.tour.title}</p></div><p>{new Date(booking.date).toLocaleDateString()}</p><p>{booking.totalPrice} {booking.currency}</p><div><span className={cn('rounded-full px-2 py-1 text-xs', getStatusColor(booking.status))}>{booking.status}</span><p className="mt-2 text-xs text-gray-400">{booking.payment?.status || 'UNPAID'}</p></div></div>)}</div></div></div>}
    </div>
  );
}

// =================== REVENUE ===================

function RevenueTab() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<{ dailyRevenue: Record<string, number>; categoryRevenue: Record<string, number>; totalPayments: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/analytics/revenue', { params: { days } });
      setData(res.data.data);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load revenue analytics.'));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={fetchRevenue} />;

  const dailyEntries = Object.entries(data?.dailyRevenue || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const totalRevenue = dailyEntries.reduce((sum, [, v]) => sum + v, 0);
  const totalPayments = data?.totalPayments || 0;
  const avgBookingValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;
  const maxDaily = Math.max(1, ...dailyEntries.map(([, v]) => v));

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                days === d
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Total Revenue ({days}d)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Average Payment Value</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(avgBookingValue)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Completed Payments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalPayments}</p>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Daily Revenue (Last {days} Days)</h3>
        {dailyEntries.length === 0 ? (
          <p className="text-gray-400 dark:text-white/40 text-sm">No completed payments in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-48 min-w-max px-1">
              {dailyEntries.map(([date, val]) => (
                <div key={date} className="w-4 flex flex-col items-center justify-end h-full group relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxDaily) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400"
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <span className="text-xs text-gray-900 dark:text-white bg-white dark:bg-dark/90 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-white/10">
                      {new Date(date).toLocaleDateString()}: {formatPrice(val)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
        {Object.keys(data?.categoryRevenue || {}).length === 0 ? (
          <p className="text-gray-400 dark:text-white/40 text-sm">No completed payments in this period.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(data?.categoryRevenue || {})
              .sort((a, b) => b[1] - a[1])
              .map(([cat, revenue]) => (
                <div key={cat} className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <span className="text-gray-500 dark:text-white/60">{getCategoryLabel(cat)}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatPrice(revenue)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
