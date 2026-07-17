'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Phone, User, LogOut, ChevronDown, Sparkles, Compass, Mountain, Car, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

/* ─── Mega-menu items ─── */
const experiences = [
  {
    title: 'Balloon Tour',
    desc: 'Sunrise flight over fairy chimneys',
    href: '/booking?tour=balloon',
    icon: Sparkles,
    gradient: 'from-rose-500/20 to-orange-500/20',
  },
  {
    title: 'ATV Tour',
    desc: 'Off-road valley adventure',
    href: '/booking?tour=atv',
    icon: Compass,
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
  {
    title: 'Daily Tours',
    desc: 'Full-day guided exploration',
    href: '/booking?tour=daily',
    icon: Mountain,
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    title: 'Private Tours',
    desc: 'Bespoke luxury experiences',
    href: '/booking?tour=private',
    icon: Car,
    gradient: 'from-violet-500/20 to-indigo-500/20',
  },
];

const navLinks = [
  { label: 'Experiences', href: '/#experiences', hasMega: true },
  { label: 'Tours', href: '/tours' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

/* ─── Animated hamburger ─── */
function HamburgerIcon({ open, isScrolled }: { open: boolean; isScrolled: boolean }) {
  return (
    <div className="relative w-6 h-5 flex flex-col justify-between">
      <motion.span
        animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        className={cn('block h-[2px] w-full rounded-full origin-center', isScrolled ? 'bg-gray-800 dark:bg-white' : 'bg-white')}
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className={cn('block h-[2px] w-full rounded-full', isScrolled ? 'bg-gray-800 dark:bg-white' : 'bg-white')}
      />
      <motion.span
        animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        className={cn('block h-[2px] w-full rounded-full origin-center', isScrolled ? 'bg-gray-800 dark:bg-white' : 'bg-white')}
      />
    </div>
  );
}

/* ─── Cursor-follow glow for Book Now ─── */
function BookNowButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springX = useSpring(glowX, { stiffness: 300, damping: 30 });
  const springY = useSpring(glowY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      glowX.set(e.clientX - rect.left);
      glowY.set(e.clientY - rect.top);
    },
    [glowX, glowY]
  );

  return (
    <Link href="/booking" ref={btnRef} onMouseMove={handleMouseMove}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="relative group overflow-hidden rounded-xl"
      >
        {/* Cursor-follow glow */}
        <motion.div
          className="pointer-events-none absolute w-24 h-24 rounded-full bg-emerald-400/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 z-0"
          style={{ left: springX, top: springY }}
        />
        {/* Animated border */}
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-border" />
        {/* Button face */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 group-hover:from-emerald-500 group-hover:to-emerald-400 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-400/50 z-10">
          Book Now
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Nav link with animated underline ─── */
function NavItem({
  label,
  href,
  isActive,
  hasMega,
  onMegaEnter,
  onMegaLeave,
  megaOpen,
  isScrolled,
}: {
  label: string;
  href: string;
  isActive: boolean;
  hasMega?: boolean;
  onMegaEnter?: () => void;
  onMegaLeave?: () => void;
  megaOpen?: boolean;
  isScrolled?: boolean;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={hasMega ? onMegaEnter : undefined}
      onMouseLeave={hasMega ? onMegaLeave : undefined}
    >
      <Link
        href={href}
        className={cn(
          'relative flex items-center gap-1 px-4 py-2 text-[14px] font-medium tracking-wide transition-colors duration-300 group',
          isScrolled
            ? 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
            : 'text-white/70 hover:text-white'
        )}
      >
        <span>{label}</span>
        {hasMega && (
          <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.span>
        )}
        {/* Animated underline */}
        <motion.span
          className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full origin-left"
          initial={false}
          animate={{ scaleX: isActive || megaOpen ? 1 : 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        />
      </Link>
    </div>
  );
}

/* ─── Main Navbar ─── */
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileExpOpen, setMobileExpOpen] = useState(false);
  const megaTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const { user, isAuthenticated, logout, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  function openMega() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }
  function closeMega() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200);
  }

  return (
    <>
      {/* ─── Desktop / Tablet nav ─── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out',
          isScrolled
            ? 'bg-white/90 dark:bg-[#050505]/85 backdrop-blur-2xl border-b border-gray-200/80 dark:border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        )}
      >
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={{ height: isScrolled ? 64 : 80 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center justify-between"
          >
            {/* ── Logo ── */}
            <Link href="/" className="relative flex items-center gap-3 group shrink-0">
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative"
              >
                {/* Glow behind logo */}
                <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                <Image
                  src="/logo.png"
                  alt="DiscoveryCappadocia"
                  width={isScrolled ? 140 : 160}
                  height={isScrolled ? 38 : 44}
                  className="relative z-10 transition-all duration-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  priority
                />
              </motion.div>
            </Link>

            {/* ── Center nav links ── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <NavItem
                  key={link.label}
                  label={link.label}
                  href={link.href}
                  isActive={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('#')[0]))}
                  hasMega={link.hasMega}
                  megaOpen={link.hasMega ? megaOpen : false}
                  onMegaEnter={link.hasMega ? openMega : undefined}
                  onMegaLeave={link.hasMega ? closeMega : undefined}
                  isScrolled={isScrolled}
                />
              ))}
            </nav>

            {/* ── Right section ── */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:+905550000000"
                className={cn(
                  'flex items-center gap-2 text-[13px] transition-colors duration-300',
                  isScrolled
                    ? 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80'
                    : 'text-white/40 hover:text-white/80'
                )}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="tracking-wide">+90 555 000 00 00</span>
              </a>

              <div className={cn('w-px h-5', isScrolled ? 'bg-gray-200 dark:bg-white/10' : 'bg-white/10')} />

              <ThemeToggle />

              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className={cn(
                        'px-3 py-1.5 text-[13px] transition-colors rounded-lg',
                        isScrolled
                          ? 'text-amber-600 dark:text-gold/80 hover:text-amber-700 dark:hover:text-gold hover:bg-amber-50 dark:hover:bg-gold/5'
                          : 'text-gold/80 hover:text-gold hover:bg-gold/5'
                      )}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-300',
                      isScrolled
                        ? 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-emerald-400" />
                    </div>
                    {user?.name?.split(' ')[0]}
                  </Link>
                  <button
                    onClick={logout}
                    className={cn(
                      'p-2 transition-colors rounded-lg',
                      isScrolled
                        ? 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                    )}
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300',
                    isScrolled
                      ? 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                      : 'text-white/60 hover:text-white border border-white/[0.15] hover:border-white/30 hover:bg-white/[0.05]'
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              <BookNowButton />
            </div>

            {/* ── Mobile toggle ── */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden relative z-50 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <HamburgerIcon open={isMobileOpen} isScrolled={isScrolled} />
            </button>
          </motion.div>
        </div>

        {/* ─── Mega Menu Dropdown ─── */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-full"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-4 gap-3">
                    {experiences.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMegaOpen(false)}
                          className="group/card relative flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 dark:border-white/[0.04] hover:border-gray-200 dark:hover:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-500"
                        >
                          {/* Gradient bg on hover */}
                          <div className={cn(
                            'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover/card:opacity-100 transition-opacity duration-500',
                            item.gradient
                          )} />
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center mb-2 group-hover/card:border-emerald-300 dark:group-hover/card:border-white/[0.15] transition-colors duration-300">
                              <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400/80 group-hover/card:text-emerald-500 dark:group-hover/card:text-emerald-300 transition-colors" />
                            </div>
                            <h4 className="text-[15px] font-semibold text-gray-800 dark:text-white/90 group-hover/card:text-gray-900 dark:group-hover/card:text-white transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[13px] text-gray-400 dark:text-white/35 group-hover/card:text-gray-500 dark:group-hover/card:text-white/55 transition-colors mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── Mobile fullscreen overlay ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop blur layer */}
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(24px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white/95 dark:bg-[#050505]/95"
            />

            {/* Noise overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full flex flex-col pt-24 px-8 pb-10 overflow-y-auto"
            >
              {/* Main mobile links */}
              <div className="flex-1 space-y-1">
                {/* Experiences with sub-menu */}
                <div>
                  <motion.button
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setMobileExpOpen(!mobileExpOpen)}
                    className="flex items-center justify-between w-full py-4 text-left"
                  >
                    <span className="text-2xl font-light tracking-wide text-gray-700 dark:text-white/80">Experiences</span>
                    <motion.span
                      animate={{ rotate: mobileExpOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-white/30" />
                    </motion.span>
                  </motion.button>
                  <AnimatePresence>
                    {mobileExpOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pl-4 space-y-1"
                      >
                        {experiences.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center">
                              <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400/70" />
                            </div>
                            <div>
                              <p className="text-[15px] text-gray-700 dark:text-white/70 font-medium">{item.title}</p>
                              <p className="text-[12px] text-gray-400 dark:text-white/30">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.filter(l => !l.hasMega).map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="block py-4 text-2xl font-light tracking-wide text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile bottom section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-4 pt-8 border-t border-gray-200 dark:border-white/[0.06]"
              >
                <a
                  href="tel:+905550000000"
                  className="flex items-center gap-3 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors py-2"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-[15px] tracking-wide">+90 555 000 00 00</span>
                </a>

                <Link
                  href="/booking"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
                >
                  Book Now
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all text-[15px]"
                    >
                      <User className="w-4 h-4" />
                      My Bookings
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileOpen(false); }}
                      className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/[0.08] text-red-400/70 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.05] transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="block w-full text-center py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all text-[15px] font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
