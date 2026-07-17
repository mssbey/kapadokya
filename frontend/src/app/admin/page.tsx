'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { formatPrice, cn, getStatusColor, getCategoryLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  BarChart3, Users, Calendar, DollarSign, TrendingUp, MapPin,
  Package, ChevronRight, ChevronLeft, Eye, EyeOff, Edit2, Trash2,
  Plus, Loader2, CreditCard,
  CheckCircle, XCircle, Clock, AlertTriangle, LogOut, X, RefreshCw
} from 'lucide-react';

type Tab = 'dashboard' | 'tours' | 'bookings' | 'payments' | 'availability' | 'customers' | 'revenue';

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
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    loadUser();
    setCheckedAuth(true);
  }, [loadUser]);

  useEffect(() => {
    if (!checkedAuth) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'ADMIN') {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [checkedAuth, user, router]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tours', label: 'Tours', icon: MapPin },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'availability', label: 'Availability', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  if (!checkedAuth || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-5rem)] bg-white dark:bg-dark-50 border-r border-gray-200 dark:border-white/5 p-4 relative">
          <div className="mb-8">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white px-3">Admin Panel</h2>
            <p className="text-gray-400 dark:text-white/40 text-xs px-3 mt-1">{user?.email}</p>
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
              Sign Out
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'tours' && <ToursTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'availability' && <AvailabilityTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'revenue' && <RevenueTab />}
        </main>
      </div>
    </div>
  );
}

// =================== DASHBOARD ===================

function DashboardTab() {
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
    { label: 'Total Bookings', value: stats?.totalBookings?.toLocaleString() || '0', icon: Calendar, change: `${stats?.bookingGrowth >= 0 ? '+' : ''}${stats?.bookingGrowth?.toFixed(0) || 0}%` },
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
              {card.change && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">Active Tours</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats?.activeTours}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">Upcoming Bookings</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats?.upcomingBookings}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500 dark:text-white/50">This Month Bookings</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats?.monthBookings}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 dark:text-white/50">Growth</span>
              <span className={cn('font-medium', stats?.bookingGrowth >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {stats?.bookingGrowth >= 0 ? '+' : ''}{stats?.bookingGrowth?.toFixed(1)}%
              </span>
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

function TourFormModal({
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

function ToursTab() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTour, setModalTour] = useState<any | null | 'new'>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Tours</h1>
        <button onClick={() => setModalTour('new')} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Tour
        </button>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={fetchTours} />
      ) : tours.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm py-10 text-center">No tours yet. Create your first one.</p>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <div key={tour.id} className="glass-card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tour.title}</h3>
                  <span className={cn('badge text-xs', tour.isActive ? 'badge-emerald' : 'badge-red')}>
                    {tour.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400 dark:text-white/40">
                  <span>{getCategoryLabel(tour.category)}</span>
                  <span>{formatPrice(tour.basePrice)}</span>
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
        <TourFormModal
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

function BookingsTab() {
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

// =================== AVAILABILITY ===================

function AvailabilityTab() {
  const [tours, setTours] = useState<any[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [toursError, setToursError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const [form, setForm] = useState({
    tourId: '',
    seatsTotal: 20,
    startDate: '',
    endDate: '',
    priceOverride: '',
  });

  const fetchTours = useCallback(async () => {
    setLoadingTours(true);
    setToursError(null);
    try {
      const res = await api.get('/admin/tours');
      setTours(res.data.data);
      setForm((f) => ({ ...f, tourId: f.tourId || res.data.data[0]?.id || '' }));
    } catch (err: any) {
      setToursError(extractError(err, 'Failed to load tours.'));
    } finally {
      setLoadingTours(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tourId || !form.startDate || !form.endDate) {
      toast.error('Please fill tour, start date and end date');
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error('End date must be after start date');
      return;
    }
    setSubmitting(true);
    setLastResult(null);
    try {
      const res = await api.post('/admin/availability/bulk', {
        tourId: form.tourId,
        startDate: form.startDate,
        endDate: form.endDate,
        seatsTotal: Number(form.seatsTotal),
        priceOverride: form.priceOverride ? Number(form.priceOverride) : undefined,
      });
      const count = res.data.count || 0;
      setLastResult(`Availability set for ${count} day${count === 1 ? '' : 's'}.`);
      toast.success(`Availability updated for ${count} day${count === 1 ? '' : 's'}`);
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to set availability'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Availability Management</h1>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bulk Set Availability</h3>

        {loadingTours ? (
          <LoadingBlock />
        ) : toursError ? (
          <ErrorBlock message={toursError} onRetry={fetchTours} />
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Tour</label>
              <select
                className="input-glass"
                value={form.tourId}
                onChange={(e) => setForm({ ...form, tourId: e.target.value })}
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Seats per Day</label>
              <input
                type="number"
                min={1}
                className="input-glass"
                value={form.seatsTotal}
                onChange={(e) => setForm({ ...form, seatsTotal: e.target.value as any })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Start Date</label>
              <input
                type="date"
                className="input-glass"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">End Date</label>
              <input
                type="date"
                className="input-glass"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Price Override (Optional)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input-glass"
                placeholder="Leave empty for base price"
                value={form.priceOverride}
                onChange={(e) => setForm({ ...form, priceOverride: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting || tours.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Set Availability
              </button>
            </div>
          </form>
        )}

        {lastResult && (
          <p className="text-emerald-400 text-sm mt-4">{lastResult}</p>
        )}
      </div>
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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/customers', { params: { limit: 20, page } });
      setCustomers(res.data.data);
      setPages(res.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Customers</h1>

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
                  <tr key={c.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
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
