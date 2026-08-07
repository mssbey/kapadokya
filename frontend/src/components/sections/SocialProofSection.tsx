'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle, Star } from 'lucide-react';
import { whatsappUrl } from '@/lib/site';

const faqs = [
  ['What happens if my balloon flight is cancelled due to weather?', 'Safety comes first. If the aviation authority cancels the flight, we will help you move to the next available date or process the refund defined by your booking terms.'],
  ['Is hotel pickup included?', 'Pickup is included on tours marked “Hotel pickup included” or “Selected hotels included.” Enter your hotel when booking so our team can confirm coverage.'],
  ['How long is the balloon flight?', 'The complete experience is usually 3–4 hours, including transfers and preparation. Flight duration depends on the package and operating conditions.'],
  ['What should I wear?', 'Wear closed shoes and layered clothing. Cappadocia mornings can be cool even during warmer months.'],
  ['Can children fly?', 'Age and height restrictions depend on the operator and current safety rules. Send us the child’s age and height before booking.'],
  ['When will I receive my pickup time?', 'Your exact pickup time is confirmed after booking, normally by the evening before your experience.'],
];

export function SocialProofSection() {
  const [active, setActive] = useState(0);
  return (
    <section id="faq" className="relative overflow-hidden bg-[#0d241f] py-20 text-white md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(217,170,82,.14),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-amber-300">Clear answers, local help</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl">Plan with confidence</h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/65">Tourism plans can change quickly. Our local support team is available before and after booking to clarify pickup, weather and cancellation details.</p>
          <a href={whatsappUrl('Hello, I have a question about a Cappadocia tour.')} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-bold"><MessageCircle className="h-5 w-5" /> Ask on WhatsApp</a>
          <div className="mt-10 flex gap-3 text-sm text-white/55"><Star className="h-5 w-5 text-amber-300" /><p>Google and Tripadvisor review widgets should be enabled only after verified business profile URLs and API access are configured.</p></div>
        </div>
        <div className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/5 px-6 backdrop-blur-sm sm:px-8">
          {faqs.map(([question, answer], index) => (
            <div key={question}>
              <button onClick={() => setActive(active === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left font-bold"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 transition ${active === index ? 'rotate-180 text-amber-300' : 'text-white/40'}`} /></button>
              {active === index && <p className="pb-6 pr-8 text-sm leading-7 text-white/62">{answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

