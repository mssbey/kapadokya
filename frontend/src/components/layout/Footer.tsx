'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gray-50 dark:bg-dark-50 border-t border-gray-200 dark:border-white/5">
      {/* CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="glass-card p-8 md:p-12 text-center bg-gradient-to-r from-emerald-50 dark:from-emerald-900/30 to-gray-50 dark:to-dark-50/80">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready for an Unforgettable Experience?
          </h3>
          <p className="text-gray-500 dark:text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Book your Cappadocia adventure today and create memories that last a lifetime.
          </p>
          <Link href="/booking" className="btn-primary inline-flex items-center gap-2 text-lg">
            Book Your Adventure
            <span>→</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="Discovery Cappadocia"
                width={160}
                height={44}
                className="drop-shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              />
            </div>
            <p className="text-gray-500 dark:text-white/50 text-sm leading-relaxed mb-6">
              Premium travel experiences in the magical land of Cappadocia. Hot air balloon flights,
              guided tours, and unforgettable adventures.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/50 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-6">Experiences</h4>
            <ul className="space-y-3">
              {['Hot Air Balloon', 'Daily Tours', 'ATV Safari', 'Private Transfer', 'VIP Packages'].map((item) => (
                <li key={item}>
                  <Link
                    href="/tours"
                    className="text-gray-500 dark:text-white/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Blog', 'Reviews', 'FAQ', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-white/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 dark:text-white/50 text-sm">
                  Göreme, Nevşehir<br />Cappadocia, Turkey
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href="tel:+905550000000" className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  +90 555 000 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href="mailto:info@discoverycappadocia.com" className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  info@discoverycappadocia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 dark:text-white/30 text-sm">
            © {new Date().getFullYear()} Discovery Cappadocia. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-300 dark:text-white/20 text-xs">Trusted by 10,000+ travelers</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-gold text-sm">★</span>
              ))}
              <span className="text-gray-400 dark:text-white/40 text-xs ml-1">4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
