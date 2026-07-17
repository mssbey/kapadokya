'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await register(name, email, password, phone || undefined);
      toast.success('Account created! Welcome aboard.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 dark:from-dark via-white dark:via-dark-50 to-gray-50 dark:to-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="DiscoveryCappadocia"
              width={200}
              height={55}
              className="drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-500"
            />
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-white/50">Join us and start your adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="input-glass"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-glass"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mb-2">
              <Phone className="w-4 h-4" />
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 555 000 0000"
              className="input-glass"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mb-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass pr-10"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-400 dark:text-white/30 text-xs mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 dark:text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
