// Minimal Resend-backed mailer. Uses the global fetch client (Node 18+) so no
// extra SDK dependency is needed. Silently no-ops (with a console warning) when
// RESEND_API_KEY isn't configured, so local/dev environments without email
// setup don't crash — callers should never let a failed send break a request.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || 'Kapadokya Travel <info@kapheratravel.com>';
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@kapheratravel.com';

async function sendEmail(options: { to: string | string[]; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn(`Email not sent (RESEND_API_KEY not configured): ${options.subject}`);
    return;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });
    if (!response.ok) {
      console.error(`Email send failed (${response.status}): ${await response.text()}`);
    }
  } catch (error) {
    console.error('Email send failed:', error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export type NewBookingNotification = {
  bookingNumber: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  isPrivate: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hotelName: string;
  notes?: string | null;
  totalPrice: number;
  currency: string;
};

export function sendNewBookingAdminNotification(booking: NewBookingNotification) {
  const guests = booking.adults + booking.children;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;">${label}</td><td style="padding:4px 0;font-weight:600;color:#111827;">${escapeHtml(value)}</td></tr>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#123f35;margin-bottom:4px;">New reservation received</h2>
      <p style="color:#6b7280;margin-top:0;">Booking #${escapeHtml(booking.bookingNumber)} — awaiting payment confirmation.</p>
      <table style="border-collapse:collapse;width:100%;">
        ${row('Tour', booking.tourTitle)}
        ${row('Date', booking.date)}
        ${row('Guests', `${guests} (${booking.adults} adult${booking.adults === 1 ? '' : 's'}${booking.children ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''})${booking.isPrivate ? ' — Private tour' : ''}`)}
        ${row('Guest name', booking.guestName)}
        ${row('Email', booking.guestEmail)}
        ${row('Phone', booking.guestPhone)}
        ${row('Hotel', booking.hotelName)}
        ${booking.notes ? row('Notes', booking.notes) : ''}
        ${row('Total', `${booking.totalPrice.toFixed(2)} ${booking.currency}`)}
      </table>
    </div>
  `.trim();

  return sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New reservation — ${booking.tourTitle} (${booking.bookingNumber})`,
    html,
  });
}
