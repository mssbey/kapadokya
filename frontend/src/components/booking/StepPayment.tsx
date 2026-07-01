'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { CreditCard, Shield, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function StepPayment() {
  const { totalPrice, getFormData, nextStep, prevStep } = useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'IYZICO'>('STRIPE');
  const [processing, setProcessing] = useState(false);

  async function handlePayment() {
    setProcessing(true);

    try {
      // Create booking
      const bookingData = getFormData();
      const bookingRes = await api.post('/bookings', bookingData);
      const { booking } = bookingRes.data.data;

      // Create payment intent
      const paymentRes = await api.post('/payments/create-intent', {
        bookingId: booking.id,
        provider: paymentMethod,
      });

      // In production, integrate with Stripe Elements or iyzico checkout
      // For now, simulate successful payment
      toast.success('Payment processed successfully!');
      nextStep();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Payment</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">Secure payment processing</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm" disabled={processing}>
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Payment Method Selection */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('STRIPE')}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 text-left',
                paymentMethod === 'STRIPE'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={cn(
                  'w-8 h-8',
                  paymentMethod === 'STRIPE' ? 'text-emerald-400' : 'text-gray-400 dark:text-white/40'
                )} />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Credit Card</div>
                  <div className="text-gray-400 dark:text-white/40 text-xs">Visa, Mastercard, Amex</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('IYZICO')}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 text-left',
                paymentMethod === 'IYZICO'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                  paymentMethod === 'IYZICO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40'
                )}>
                  iy
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">iyzico</div>
                  <div className="text-gray-400 dark:text-white/40 text-xs">Turkish cards & more</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Card Form Placeholder */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Card Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="input-glass font-mono"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">Expiry</label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="input-glass"
                  maxLength={7}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-white/50 mb-1.5 block">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="input-glass"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-6 text-gray-400 dark:text-white/30 text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            SSL Encrypted
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            PCI Compliant
          </div>
        </div>

        {/* Pay Button */}
        <motion.button
          onClick={handlePayment}
          disabled={processing}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full py-5 rounded-xl font-bold text-lg transition-all duration-300',
            'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white',
            'shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40',
            'flex items-center justify-center gap-3',
            processing && 'opacity-80 cursor-wait'
          )}
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay {formatPrice(totalPrice)} Securely
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
