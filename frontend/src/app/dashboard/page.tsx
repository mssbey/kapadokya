'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Booking } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  LogOut,
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  CONFIRMED: 'text-emerald-400 bg-emerald-500/10',
  PENDING: 'text-yellow-400 bg-yellow-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
  COMPLETED: 'text-blue-400 bg-blue-500/10',
};

const statusIcons: Record<string, React.ReactNode> = {
  CONFIRMED: <CheckCircle2 className="w-4 h-4" />,
  PENDING: <AlertCircle className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
};

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  async function loadBookings() {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || res.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.tourDate) >= now && b.status !== 'CANCELLED');
  const past = bookings.filter((b) => new Date(b.tourDate) < now || b.status === 'CANCELLED');
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="text-emerald-500 dark:text-emerald-400">{user?.name?.split(' ')[0] || 'Traveler'}</span>
            </h1>
            <p className="text-gray-500 dark:text-white/50 mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/booking')}
              className="btn-primary text-sm !py-2"
            >
              Book New Tour
            </button>
            <button
              onClick={handleLogout}
              className="glass px-4 py-2 rounded-xl text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Calendar },
            { label: 'Upcoming', value: upcoming.length, icon: Clock },
            { label: 'Completed', value: bookings.filter((b) => b.status === 'COMPLETED').length, icon: CheckCircle2 },
            {
              label: 'Total Spent',
              value: formatPrice(bookings.reduce((sum, b) => sum + b.totalPrice, 0)),
              icon: CreditCard,
            },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4">
              <stat.icon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-gray-400 dark:text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-1 mb-6 glass rounded-xl p-1 w-fit">
            {(['upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab} ({tab === 'upcoming' ? upcoming.length : past.length})
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-white/40 text-lg mb-2">
                {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => router.push('/tours')}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Browse our experiences
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-4 group hover:border-emerald-500/20 transition-all"
                >
                  {/* Tour icon */}
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {(booking as any).tour?.title || `Booking #${booking.id.slice(0, 8)}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 dark:text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(booking.tourDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {booking.adultCount} adult{booking.adultCount > 1 ? 's' : ''}
                        {booking.childCount > 0 && `, ${booking.childCount} child`}
                      </span>
                    </div>
                  </div>

                  {/* Status & Price */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                        statusColors[booking.status] || 'text-white/40 bg-white/5'
                      }`}
                    >
                      {statusIcons[booking.status]}
                      {booking.status}
                    </span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white min-w-[80px] text-right">
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
