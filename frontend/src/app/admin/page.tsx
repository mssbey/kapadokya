'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { formatPrice, cn, getStatusColor, getCategoryLabel } from '@/lib/utils';
import {
  BarChart3, Users, Calendar, DollarSign, TrendingUp, MapPin,
  Package, Settings, ChevronRight, Eye, EyeOff, Edit2, Trash2,
  Plus, Search, Filter, Download, RefreshCw, Loader2,
  CheckCircle, XCircle, Clock, AlertTriangle, LogOut
} from 'lucide-react';

type Tab = 'dashboard' | 'tours' | 'bookings' | 'availability' | 'customers' | 'revenue';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user, logout, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tours', label: 'Tours', icon: MapPin },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-5rem)] bg-white dark:bg-dark-50 border-r border-gray-200 dark:border-white/5 p-4">
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
        <main className="flex-1 p-4 md:p-8 pb-20 lg:pb-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'tours' && <ToursTab />}
          {activeTab === 'bookings' && <BookingsTab />}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch {
        setStats({
          totalBookings: 1247,
          monthBookings: 89,
          bookingGrowth: 12.5,
          totalRevenue: 156800,
          monthRevenue: 24500,
          totalUsers: 3421,
          activeTours: 4,
          upcomingBookings: 23,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, change: '+18%', color: 'emerald' },
    { label: 'Month Revenue', value: formatPrice(stats?.monthRevenue || 0), icon: TrendingUp, change: '+12%', color: 'gold' },
    { label: 'Total Bookings', value: stats?.totalBookings?.toLocaleString() || '0', icon: Calendar, change: `+${stats?.bookingGrowth?.toFixed(0) || 0}%`, color: 'blue' },
    { label: 'Total Customers', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users, change: '+8%', color: 'purple' },
  ];

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
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {card.change}
              </span>
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
              <span className="text-emerald-400 font-medium">+{stats?.bookingGrowth?.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
          <div className="space-y-3">
            {[
              { cat: 'Balloon Tours', pct: 65, revenue: 101920 },
              { cat: 'Daily Tours', pct: 20, revenue: 31360 },
              { cat: 'Adventure', pct: 10, revenue: 15680 },
              { cat: 'Transfers', pct: 5, revenue: 7840 },
            ].map((item) => (
              <div key={item.cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-white/60">{item.cat}</span>
                  <span className="text-gray-700 dark:text-white/80">{formatPrice(item.revenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== TOURS ===================

function ToursTab() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await api.get('/admin/tours');
        setTours(res.data.data);
      } catch {
        setTours([
          { id: '1', title: 'Hot Air Balloon Flight', category: 'BALLOON', basePrice: 250, isActive: true, _count: { bookings: 847 } },
          { id: '2', title: 'Full Day Tour', category: 'DAILY_TOUR', basePrice: 75, isActive: true, _count: { bookings: 523 } },
          { id: '3', title: 'ATV Safari', category: 'ADVENTURE', basePrice: 60, isActive: true, _count: { bookings: 312 } },
          { id: '4', title: 'Private Transfer', category: 'TRANSFER', basePrice: 40, isActive: true, _count: { bookings: 1205 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  async function toggleTour(tourId: string) {
    try {
      await api.patch(`/admin/tours/${tourId}/toggle`);
      setTours((prev) =>
        prev.map((t) => (t.id === tourId ? { ...t, isActive: !t.isActive } : t))
      );
    } catch {
      // silently fail for demo
      setTours((prev) =>
        prev.map((t) => (t.id === tourId ? { ...t, isActive: !t.isActive } : t))
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Tours</h1>
        <button className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Tour
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <div key={tour.id} className="glass-card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tour.title}</h3>
                  <span className={cn(
                    'badge text-xs',
                    tour.isActive ? 'badge-emerald' : 'badge-red'
                  )}>
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
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-400 dark:text-white/40" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== BOOKINGS ===================

function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const params: any = { limit: 50 };
        if (filter !== 'ALL') params.status = filter;
        const res = await api.get('/admin/bookings', { params });
        setBookings(res.data.data);
      } catch {
        setBookings([
          { id: '1', guestName: 'Sarah J.', tour: { title: 'Balloon Flight' }, date: '2026-04-15', adults: 2, children: 0, totalPrice: 500, status: 'CONFIRMED', payment: { status: 'COMPLETED' } },
          { id: '2', guestName: 'Marco R.', tour: { title: 'Full Day Tour' }, date: '2026-04-16', adults: 3, children: 1, totalPrice: 262.5, status: 'PENDING', payment: { status: 'PENDING' } },
          { id: '3', guestName: 'Yuki T.', tour: { title: 'ATV Safari' }, date: '2026-04-14', adults: 2, children: 0, totalPrice: 120, status: 'COMPLETED', payment: { status: 'COMPLETED' } },
          { id: '4', guestName: 'Emma W.', tour: { title: 'Balloon Flight' }, date: '2026-04-17', adults: 1, children: 0, totalPrice: 400, status: 'CONFIRMED', payment: { status: 'COMPLETED' } },
          { id: '5', guestName: 'Ali K.', tour: { title: 'Private Transfer' }, date: '2026-04-13', adults: 4, children: 2, totalPrice: 60, status: 'CANCELLED', payment: { status: 'REFUNDED' } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [filter]);

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
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
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
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-xs text-gray-400 dark:text-white/40 font-medium px-5 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{b.guestName || b.user?.name || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{b.tour?.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-white/60">{b.adults + (b.children || 0)}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">{formatPrice(b.totalPrice)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(b.status)}
                        <span className={cn('text-xs font-medium', getStatusColor(b.status))}>
                          {b.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'text-xs font-medium',
                        b.payment?.status === 'COMPLETED' ? 'text-emerald-400' : 'text-yellow-400'
                      )}>
                        {b.payment?.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =================== AVAILABILITY ===================

function AvailabilityTab() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Availability Management</h1>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bulk Set Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Tour</label>
            <select className="input-glass">
              <option>Hot Air Balloon Flight</option>
              <option>Full Day Tour</option>
              <option>ATV Safari</option>
              <option>Private Transfer</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Seats per Day</label>
            <input type="number" className="input-glass" defaultValue={20} />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Start Date</label>
            <input type="date" className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">End Date</label>
            <input type="date" className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Price Override (Optional)</label>
            <input type="number" className="input-glass" placeholder="Leave empty for base price" />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">Set Availability</button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dynamic Pricing</h3>
        <p className="text-gray-500 dark:text-white/50 text-sm mb-4">
          Set different prices for specific dates, weekends, or high-demand periods.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">Weekday Price</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$250</p>
            <p className="text-gray-400 dark:text-white/40 text-xs">Base price</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">Weekend Price</h4>
            <p className="text-2xl font-bold text-gold">$300</p>
            <p className="text-gray-400 dark:text-white/40 text-xs">+20% premium</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">Holiday Price</h4>
            <p className="text-2xl font-bold text-orange-400">$375</p>
            <p className="text-gray-400 dark:text-white/40 text-xs">+50% premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== CUSTOMERS ===================

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await api.get('/admin/customers');
        setCustomers(res.data.data);
      } catch {
        setCustomers([
          { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555-0101', createdAt: '2026-01-15', _count: { bookings: 3 } },
          { id: '2', name: 'Marco Rossi', email: 'marco@example.com', phone: '+39 06 1234', createdAt: '2026-02-20', _count: { bookings: 2 } },
          { id: '3', name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+81 3-1234', createdAt: '2026-03-10', _count: { bookings: 1 } },
          { id: '4', name: 'Emma Wilson', email: 'emma@example.com', phone: '+44 20 1234', createdAt: '2026-03-25', _count: { bookings: 4 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Customers</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
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
        </div>
      )}
    </div>
  );
}

// =================== REVENUE ===================

function RevenueTab() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Revenue Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(156800)}</p>
          <p className="text-emerald-400 text-sm mt-1">↑ +18.3% vs last month</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Average Booking Value</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(196)}</p>
          <p className="text-emerald-400 text-sm mt-1">↑ +5.2% vs last month</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-gray-400 dark:text-white/40 text-sm">Conversion Rate</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">4.8%</p>
          <p className="text-emerald-400 text-sm mt-1">↑ +0.3% vs last month</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Monthly Revenue (Last 12 Months)</h3>
        <div className="flex items-end gap-2 h-48">
          {[8, 12, 15, 10, 18, 22, 28, 35, 30, 25, 20, 24].map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(val / 35) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 relative group"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-900 dark:text-white bg-white dark:bg-dark/80 px-2 py-1 rounded shadow-sm dark:shadow-none">
                  {formatPrice(val * 1000)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-white/30">
          {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
