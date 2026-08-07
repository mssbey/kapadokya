'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function StripeForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  async function submit() {
    if (!stripe || !elements) return;
    setProcessing(true);
    const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/booking?payment=return` }, redirect: 'if_required' });
    setProcessing(false);
    if (result.error) return toast.error(result.error.message || 'Payment could not be completed.');
    if (result.paymentIntent?.status === 'succeeded') { window.dataLayer?.push({ event: 'purchase', value: amount, currency: 'EUR' }); onSuccess(); }
    else toast('Your payment is being confirmed. Please keep this page open.');
  }

  return <div className="space-y-5"><div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"><PaymentElement /></div><button onClick={submit} disabled={!stripe || processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white disabled:opacity-60">{processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} Pay {formatPrice(amount)} securely</button></div>;
}

export function StepPayment() {
  const { totalPrice, getFormData, nextStep, prevStep } = useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'IYZICO'>('STRIPE');
  const [preparing, setPreparing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [iyzicoForm, setIyzicoForm] = useState('');
  const [promoCode, setPromoCode] = useState('');

  async function preparePayment() {
    setPreparing(true);
    try {
      window.dataLayer?.push({ event: 'begin_checkout', value: totalPrice, currency: 'EUR' });
      const bookingRes = await api.post('/bookings', { ...getFormData(), promoCode: promoCode.trim() || undefined });
      const booking = bookingRes.data.data.booking;
      sessionStorage.setItem('dc_last_booking_id', booking.id);
      const paymentRes = await api.post('/payments/create-intent', { bookingId: booking.id, provider: paymentMethod });
      if (paymentMethod === 'STRIPE') {
        if (!paymentRes.data.data.clientSecret) throw new Error('Secure payment session could not be created.');
        setClientSecret(paymentRes.data.data.clientSecret);
      } else {
        if (!paymentRes.data.data.checkoutFormContent) throw new Error('iyzico checkout could not be created.');
        setIyzicoForm(paymentRes.data.data.checkoutFormContent);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Payment setup failed. No charge was made.');
    } finally { setPreparing(false); }
  }

  if (clientSecret && stripePromise) return <div><h2 className="mb-6 font-display text-2xl font-bold">Secure card payment</h2><Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}><StripeForm amount={totalPrice} onSuccess={nextStep} /></Elements></div>;
  if (iyzicoForm) return <div><h2 className="mb-6 font-display text-2xl font-bold">Secure iyzico payment</h2><div className="rounded-2xl bg-white p-5" dangerouslySetInnerHTML={{ __html: iyzicoForm }} /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">Payment</h2><p className="mt-1 text-sm text-gray-500 dark:text-white/50">Your booking is not confirmed until payment succeeds.</p></div><button onClick={prevStep} className="glass-button text-sm" disabled={preparing}>← Back</button></div>
      <div className="space-y-6">
        <div className="glass-card p-6"><h3 className="mb-4 font-semibold">Select payment method</h3><div className="grid grid-cols-2 gap-3"><button onClick={() => setPaymentMethod('STRIPE')} className={cn('rounded-xl border p-4 text-left', paymentMethod === 'STRIPE' ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-white/10')}><CreditCard className="mb-2 h-7 w-7 text-emerald-500" /><b>Credit card</b><p className="mt-1 text-xs text-gray-400">Visa, Mastercard</p></button><button onClick={() => setPaymentMethod('IYZICO')} className={cn('rounded-xl border p-4 text-left', paymentMethod === 'IYZICO' ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-white/10')}><div className="mb-2 text-xl font-extrabold text-emerald-500">iy</div><b>iyzico</b><p className="mt-1 text-xs text-gray-400">Secure local checkout</p></button></div></div>
        <div className="glass-card p-6"><label className="text-sm font-semibold" htmlFor="promo">Promo code</label><div className="mt-2 flex gap-2"><input id="promo" value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} placeholder="Enter code" className="input-glass uppercase" /><span className="self-center text-xs text-gray-400">Validated securely</span></div></div>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-gray-400"><span className="flex gap-1"><ShieldCheck className="h-4 w-4" /> SSL secured</span><span className="flex gap-1"><Lock className="h-4 w-4" /> 3D Secure where supported</span><span>Card data handled by payment provider</span></div>
        {!publishableKey && paymentMethod === 'STRIPE' && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-300/10 dark:text-amber-200">Card checkout is disabled until NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured.</p>}
        <button onClick={preparePayment} disabled={preparing || (paymentMethod === 'STRIPE' && !publishableKey)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{preparing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} Continue to secure payment · {formatPrice(totalPrice)}</button>
      </div>
    </div>
  );
}
