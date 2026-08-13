/**
 * One-off migration of the legal/customer-support pages from hardcoded
 * frontend TSX into the LegalPage table, so they become admin-editable.
 * Idempotent (upsert by slug) — safe to re-run, though re-running after an
 * admin has edited a page in the dashboard would overwrite their edits.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SITE = {
  legalName: 'Cappadocia Kaphera Travel Agency',
  phoneDisplay: '+90 540 101 50 50',
  email: 'info@kapheratravel.com',
  address: 'Cappadocia, Nevşehir, Türkiye',
  tursabNumber: '18577',
};

type Section = {
  title: string;
  body?: string;
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  footnote?: string;
};

type LegalPage = { slug: string; title: string; intro: string; sections: Section[] };

const CANCELLATION_TABLE = {
  head: ['Experience', 'Cancelled more than 72h before start', '24–72h before start', 'Less than 24h before start, or no-show'],
  rows: [
    ['Balloon flights', 'Full refund', '50% refund', 'No refund'],
    ['Daily, private and cultural tours', 'Full refund', 'Full refund up to 48h, then 50%', 'No refund'],
    ['Adventure activities (ATV, horse riding, Jeep)', 'Full refund', 'Full refund up to 48h, then 50%', 'No refund'],
    ['Airport transfers', 'Full refund', 'Full refund', 'No refund'],
  ],
};

const pages: LegalPage[] = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    intro:
      'These terms explain the general rules for using Discovery Cappadocia and booking travel services through it. They apply alongside the product-specific conditions shown at checkout.',
    sections: [
      {
        title: 'Who you are contracting with',
        body: `Discovery Cappadocia is operated by ${SITE.legalName}, a travel agency licensed in Türkiye under TÜRSAB registration number ${SITE.tursabNumber}, based in ${SITE.address}. Some experiences — balloon flights in particular — are performed by licensed third-party operators. Where that is the case, we act as the booking agent and the operator's own safety and carriage rules also apply to you.`,
      },
      {
        title: 'How a booking is formed',
        body:
          'Selecting an experience and submitting the booking form is an offer, not a confirmed reservation. A contract exists only once payment is accepted and we issue a written confirmation containing a reservation number. Until that confirmation reaches you, no seat is held.',
        list: [
          'Prices shown in currencies other than EUR are indicative conversions; the checkout total is the binding amount.',
          'Prices include applicable Turkish taxes unless the product page states otherwise.',
          'Obvious pricing errors do not bind us; we will contact you and offer a correct price or a full refund.',
        ],
      },
      {
        title: 'What you are responsible for',
        list: [
          'Accurate names, contact details, hotel address and any flight information.',
          'Being at the agreed pickup point at the agreed time — drivers cannot wait indefinitely.',
          'Declaring pregnancy, recent surgery, heart or back conditions, and any mobility limitation before booking.',
          'Following the pilot, guide or driver’s safety instructions throughout the activity.',
          'Valid personal travel insurance; the flight insurance included with balloon tickets is the operator’s liability cover, not a substitute.',
        ],
        footnote:
          'A participant who misses pickup, arrives unfit to take part, or refuses a safety instruction is treated as a no-show under the cancellation policy.',
      },
      {
        title: 'Age, weight and health limits',
        body:
          'Balloon operators set minimum age and, for some baskets, weight limits under aviation rules, and these can change. ATV and horse riding have their own minimum ages and licence requirements. Send us the participant’s age and, for balloon flights, approximate weight before booking so we can confirm eligibility in writing.',
      },
      {
        title: 'Changes we may have to make',
        body:
          'Routes, pickup times, stop order and vehicle allocation may change where weather, safety, traffic, site closures or aviation authority decisions require it. Where a change materially reduces what you booked, we offer a reschedule or the relevant refund. Minor timing shifts are not a material change.',
      },
      {
        title: 'Liability',
        body:
          'We are liable for the booking service we provide. We are not liable for losses caused by circumstances outside reasonable control — weather, authority decisions, strikes, road closures — nor for consequential losses such as missed connecting flights, where you were advised of the risk. Nothing here limits liability that cannot lawfully be limited, including for death or personal injury caused by negligence.',
      },
      {
        title: 'Complaints and applicable law',
        body: `Raise any problem with the guide or driver at the time, so it can be fixed on the spot, and write to ${SITE.email} within 14 days of the experience. These terms are governed by Turkish law, and consumer arbitration committees and consumer courts in Türkiye remain available to you.`,
      },
      {
        title: 'Contact',
        body: `${SITE.legalName} · TÜRSAB No: ${SITE.tursabNumber} · ${SITE.address} · ${SITE.email} · ${SITE.phoneDisplay}.`,
      },
    ],
  },

  {
    slug: 'cancellation-refund',
    title: 'Cancellation & Refund Policy',
    intro:
      'This page is the single source of truth for cancellation windows. The window that applies to your booking is also shown before payment and repeated on your voucher — those three always state the same thing.',
    sections: [
      {
        title: 'Standard cancellation windows',
        body:
          'Windows are measured from the published start time of the experience to the moment your written cancellation request reaches us. Each window below is exclusive of the next: exactly one row and one column applies to any given cancellation.',
        table: CANCELLATION_TABLE,
        footnote:
          'If a product page states a different window for a specific experience, that product page governs and its wording is what appears at checkout and on your voucher.',
      },
      {
        title: 'How to cancel',
        body: `Send your reservation number and the name on the booking to ${SITE.email} or by WhatsApp to ${SITE.phoneDisplay}. We reply with a written acknowledgement stating the date and time your request was received; that timestamp determines the window. A cancellation is not effective until acknowledged.`,
      },
      {
        title: 'When we cancel',
        body:
          'If an experience cannot operate — weather, unsafe wind, aviation authority decision, vehicle failure, insufficient minimum numbers — you may choose either a reschedule to the next available date at no extra cost or a full refund of everything paid, including add-ons. No cancellation fee is charged in this case, whatever the timing.',
      },
      {
        title: 'Balloon flights specifically',
        body:
          'Sunrise flights are cancelled on the morning itself more often than any other product, and the decision belongs to the operator and the aviation authority, not to us. A morning cancellation is always an operator cancellation under the section above — reschedule or full refund, never a fee — even though it happens inside the 24-hour window.',
      },
      {
        title: 'No-shows and partial use',
        list: [
          'Missing pickup without notice is a no-show: no refund.',
          'Leaving an experience part-way through, for any reason other than our failure to deliver it, is not refundable.',
          'A participant refused boarding for undeclared health, age or weight reasons is treated as a no-show.',
        ],
      },
      {
        title: 'Refund timing and method',
        body:
          'Approved refunds go back to the original payment method — we cannot redirect them to a different card or account. We submit the refund within 5 business days of approving it. Your bank or card issuer then takes its own time, commonly 5 to 10 business days, which is outside our control.',
      },
      {
        title: 'Amendments instead of cancellation',
        body:
          'Date changes requested more than 72 hours before the start are free where the new date has availability. Inside 72 hours a date change is treated as a cancellation followed by a new booking, and the table above applies.',
      },
    ],
  },

  {
    slug: 'distance-sales',
    title: 'Distance Sales Agreement',
    intro:
      'This agreement covers services sold remotely through this website. It sets out who is selling, what is being sold, what you pay and how you exit — the cancellation terms themselves are not repeated here, to keep one version of them on the site.',
    sections: [
      {
        title: 'Parties',
        body: `Seller: ${SITE.legalName}, TÜRSAB No: ${SITE.tursabNumber}, ${SITE.address}, ${SITE.email}, ${SITE.phoneDisplay}. Buyer: the person whose name, address, email and telephone number are entered at checkout and reproduced on the booking confirmation.`,
      },
      {
        title: 'Subject of the agreement',
        body:
          'The subject is the specific experience selected at checkout, on the selected date, for the stated number of participants, with the inclusions and exclusions listed on that experience’s page at the time of purchase. The confirmation email records the version you agreed to.',
      },
      {
        title: 'Pre-contract information you receive before paying',
        list: [
          'The exact service, date, start time and participant count.',
          'Pickup arrangement and whether it is included.',
          'The total price including taxes, and any separately itemised add-on.',
          'The payment method and schedule.',
          'The cancellation window applying to that product, and a link to the full policy.',
          'Seller identity, licence number and contact channels.',
        ],
      },
      {
        title: 'Price and payment',
        body:
          'The total shown on the payment step is the amount charged. Card details are entered on the payment provider’s own secure page and are never stored by us. Where 3D Secure is supported by your bank it is applied. Your booking is not confirmed, and no place is held, until the payment provider reports a successful charge.',
      },
      {
        title: 'Delivery of the service',
        body:
          'Performance is delivery: the service is delivered by the experience taking place on the agreed date. A durable confirmation containing the reservation number, service details and total is sent by email immediately after payment, and again as a voucher with the confirmed pickup time, normally by the evening before.',
      },
      {
        title: 'Right of withdrawal',
        body:
          'Under Turkish distance-contract rules, services tied to a specific date or period of performance — which is what every experience on this site is — are excluded from the standard 14-day right of withdrawal. Your exit route is the cancellation policy instead, which is why it is written with concrete windows rather than left to discretion.',
        footnote: 'Cancellation windows and refund amounts: see the Cancellation & Refund Policy.',
      },
      {
        title: 'Complaints and dispute resolution',
        body: `Complaints go to ${SITE.email} with the reservation number. Turkish consumer arbitration committees and consumer courts, at the buyer’s place of residence or of purchase, have jurisdiction up to and above the applicable monetary thresholds respectively.`,
      },
      {
        title: 'Acceptance',
        body:
          'Ticking the confirmation box at checkout records that you read this agreement and the pre-contract information before paying. A copy is retained with your reservation record and can be re-sent on request.',
      },
    ],
  },

  {
    slug: 'privacy',
    title: 'Privacy Policy',
    intro:
      'This policy describes what personal data this site collects, why, who else sees it and how long it is kept. It covers the booking flow, WhatsApp support and website analytics.',
    sections: [
      {
        title: 'What we collect',
        list: [
          'Identity and contact: name, email, telephone, and WhatsApp number if you message us.',
          'Booking: experience, date, participant count, hotel or pickup address, special requests.',
          'Health-adjacent details you volunteer — pregnancy, mobility, age or weight for balloon eligibility — used only to confirm eligibility and deleted after the experience.',
          'Payment reference: transaction identifier and result. Full card numbers are held by the payment provider, never by us.',
          'Technical: IP address, device and browser type, pages viewed, and your cookie consent choice.',
        ],
      },
      {
        title: 'Why we use it, and on what basis',
        list: [
          'To create and perform your reservation — performance of a contract.',
          'To send pickup times, changes and cancellation notices — performance of a contract.',
          'To keep accounting and travel-agency records — legal obligation.',
          'To prevent fraudulent bookings and chargebacks — legitimate interest.',
          'To measure site performance and marketing — consent only, via the cookie banner.',
        ],
      },
      {
        title: 'Who else receives it',
        body:
          'Only what each recipient needs: the operator running your experience (name, participant count, pickup point), the transport provider (pickup address and phone), the payment provider (billing details), and public authorities where a legal duty applies. We do not sell personal data or share it for third-party marketing.',
      },
      {
        title: 'International transfers',
        body:
          'Some processors — hosting, email and, where you consented, analytics — operate outside Türkiye. Transfers rely on the safeguards required by applicable data protection law, and are limited to the data those services need to function.',
      },
      {
        title: 'How long it is kept',
        list: [
          'Booking and payment records: retained for the statutory accounting period, then deleted.',
          'Support conversations: 12 months after the last message.',
          'Eligibility details you volunteered: deleted once the experience has taken place.',
          'Analytics data: for the retention period of the analytics tool, and only if you consented.',
        ],
      },
      {
        title: 'Your rights',
        body: `You can ask what we hold, have it corrected, have it deleted where no legal duty requires us to keep it, object to processing based on legitimate interest, and withdraw analytics consent at any time by clearing site storage. Write to ${SITE.email}; we may verify your identity before acting, and we respond within the statutory period.`,
      },
      {
        title: 'Security',
        body:
          'The site is served over TLS, payment pages are hosted by the payment provider, and access to reservation data is limited to staff who need it operationally. No system is perfectly secure; if a breach affects you, we notify you and the authority as the law requires.',
      },
    ],
  },

  {
    slug: 'kvkk',
    title: 'KVKK Aydınlatma Metni / Personal Data Notice',
    intro:
      'This notice is the disclosure required by Türkiye’s Personal Data Protection Law No. 6698 (KVKK). It complements the Privacy Policy, which describes the same processing in plain operational terms.',
    sections: [
      {
        title: 'Data controller',
        body: `The data controller is ${SITE.legalName} (TÜRSAB No: ${SITE.tursabNumber}), ${SITE.address}, contactable at ${SITE.email} and ${SITE.phoneDisplay}.`,
      },
      {
        title: 'Categories of data processed',
        body:
          'Identity, contact, customer transaction, marketing (where consented), physical space security data where an operator maintains it, and transaction security data such as IP records. Health-adjacent eligibility information is processed as special category data, only where you provide it and only for the eligibility check.',
      },
      {
        title: 'Purposes of processing',
        list: [
          'Establishing and performing the reservation contract.',
          'Communicating pickup, timing and cancellation information.',
          'Fulfilling record-keeping duties under travel agency and tax legislation.',
          'Managing requests, complaints and refund processes.',
          'Ensuring participant safety and meeting operator eligibility rules.',
        ],
      },
      {
        title: 'Legal grounds under Article 5 and 6',
        list: [
          'Necessity for the establishment or performance of a contract (Art. 5/2-c).',
          'Compliance with a legal obligation to which the controller is subject (Art. 5/2-a).',
          'Legitimate interests of the controller, without prejudice to your rights (Art. 5/2-f).',
          'Explicit consent, for marketing measurement and for special category eligibility data (Art. 5/1 and Art. 6/2).',
        ],
      },
      {
        title: 'Method of collection',
        body:
          'Data is collected by electronic means: the booking form on this site, WhatsApp and email correspondence, the payment provider’s response, and cookies where you consented to them.',
      },
      {
        title: 'Transfers',
        body:
          'Data may be transferred to tour and balloon operators, transport providers, the payment institution, hosting and email service providers, our accountants, and to authorised public bodies where legally required — in each case limited to the purposes above and subject to KVKK transfer conditions.',
      },
      {
        title: 'Your rights under Article 11',
        list: [
          'Learn whether your personal data is processed, and request information about it.',
          'Learn the purpose and whether it is used consistently with that purpose.',
          'Know the third parties to whom it is transferred, in Türkiye or abroad.',
          'Request correction of incomplete or inaccurate data, and notification of that correction to transferees.',
          'Request erasure or destruction where the grounds for processing have disappeared.',
          'Object to a result produced solely by automated analysis, and claim compensation for damage caused by unlawful processing.',
        ],
      },
      {
        title: 'How to apply',
        body: `Applications may be sent to ${SITE.email} or in writing to the address above, in accordance with the Communiqué on Application Procedures. Identity verification may be requested. We respond within thirty days at the latest, free of charge unless the request requires an additional cost.`,
      },
    ],
  },

  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    intro:
      'This site sets a small number of cookies and similar browser storage entries. Everything beyond what the booking flow strictly needs is loaded only after you press “Accept all”.',
    sections: [
      {
        title: 'Strictly necessary — always active',
        table: {
          head: ['Purpose', 'What it stores', 'Lifetime'],
          rows: [
            ['Consent record', 'Your cookie banner choice', 'Until cleared'],
            ['Booking state', 'The in-progress booking so a refresh does not lose it', 'Session'],
            ['Preferences', 'Language, currency and light/dark theme', 'Until cleared'],
            ['Security', 'Request integrity and abuse prevention', 'Session'],
          ],
        },
        footnote:
          'These cannot be switched off, because without them the booking flow cannot deliver the service you asked for.',
      },
      {
        title: 'Analytics and advertising — consent only',
        body:
          'Google Tag Manager and the measurement tools connected through it are loaded only after “Accept all” is selected, and only when their identifiers are actually configured for this deployment. Choosing “Essential only” means these scripts are never injected — not merely blocked from firing.',
      },
      {
        title: 'What we do not do',
        list: [
          'No cookies are set before you answer the banner, other than the strictly necessary ones above.',
          'No cross-site advertising profile is built from your visit.',
          'No cookie data is sold or shared with data brokers.',
        ],
      },
      {
        title: 'Changing or withdrawing your choice',
        body:
          'Clear this site’s cookies and local storage in your browser settings. The consent banner reappears on your next visit and any previously loaded analytics scripts stop being injected. Blocking all cookies at browser level will also stop the booking flow from remembering your progress.',
      },
      {
        title: 'Third-party pages',
        body:
          'The payment provider’s checkout page and any embedded map or messaging service set their own cookies under their own policies. Once you leave this site for a payment page, that provider’s cookie policy applies to that page.',
      },
    ],
  },
];

async function main() {
  for (const page of pages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: { slug: page.slug, title: page.title, intro: page.intro, sections: page.sections as any },
    });
    console.log(`✓ ${page.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
