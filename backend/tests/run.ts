import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import request from 'supertest';

if (!process.env.TEST_DATABASE_URL || !/migration_test|test_/i.test(process.env.TEST_DATABASE_URL)) {
  throw new Error('TEST_DATABASE_URL must point to an isolated database whose name contains "test".');
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-that-is-long-enough';
process.env.VERCEL = '1';
process.env.FRONTEND_URLS = 'http://localhost:3000';
process.env.REDIS_URL = 'redis://127.0.0.1:6399';
process.env.STRIPE_SECRET_KEY = 'sk_test_integration_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_integration_only';

async function main() {
  const [{ app }, { prisma }, { generateToken }] = await Promise.all([
    import('../src/index'), import('../src/lib/prisma'), import('../src/middleware/auth'),
  ]);
  const password = await bcrypt.hash('TestPassword123!', 4);
  const [admin, user] = await Promise.all([
    prisma.user.create({ data: { name: 'Test Admin', email: 'admin@test.local', password, role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'Test User', email: 'user@test.local', password, role: 'USER' } }),
  ]);
  const adminToken = generateToken(admin); const userToken = generateToken(user);

  const forbidden = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${userToken}`);
  assert.equal(forbidden.status, 403, 'non-admin must not access admin API');

  const tourPayload = {
    slug: 'integration-test-tour', category: 'DAILY_TOUR', tourType: 'GROUP', basePrice: 100, discountedPrice: 80, currency: 'EUR',
    childPriceRate: .5, privatePriceMultiplier: 1.5, duration: '3 hours', startTime: '09:00', endTime: '12:00',
    maxCapacity: 2, minParticipants: 1, defaultCapacity: 2, isActive: true, isFeatured: true, isBookingEnabled: true, sortOrder: 1,
    translations: [
      { locale: 'en', title: 'Integration Test Tour', shortDesc: 'A live integration tour', description: 'A sufficiently long integration test description.', highlights: [], includes: [], excludes: [] },
      { locale: 'tr', title: 'Entegrasyon Test Turu', shortDesc: 'Canlı entegrasyon turu', description: 'Yeterince uzun entegrasyon testi açıklamasıdır.', highlights: [], includes: [], excludes: [] },
    ], upsells: [],
  };
  const created = await request(app).post('/api/admin/tours').set('Authorization', `Bearer ${adminToken}`).send(tourPayload);
  assert.equal(created.status, 201, created.body?.message);
  const tourId = created.body.data.id;

  const publicList = await request(app).get('/api/tours?locale=tr');
  assert.equal(publicList.status, 200);
  assert.equal(publicList.body.data[0].title, 'Entegrasyon Test Turu', 'admin-created translation must reach public site API');
  assert.equal(publicList.body.data[0].basePrice, 80, 'public price must use the active discount');
  const categoryRoute = await request(app).get('/api/tours/category/DAILY_TOUR?locale=en');
  assert.equal(categoryRoute.status, 200, 'static category route must not be captured as a slug');

  const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const availability = await request(app).post('/api/admin/availability').set('Authorization', `Bearer ${adminToken}`).send({ tourId, date, seatsAvailable: 2, seatsTotal: 2, priceOverride: 70, isBlocked: false });
  assert.equal(availability.status, 200, availability.body?.message);

  const bookingBody = { tourId, date, adults: 2, children: 0, isPrivate: false, guestName: 'Test Guest', guestEmail: 'guest@test.local', guestPhone: '+905551112233', hotelName: 'Test Cave Hotel' };
  const childrenRejected = await request(app).post('/api/bookings').send({ ...bookingBody, adults: 1, children: 1 });
  assert.equal(childrenRejected.status, 400, 'new bookings must use one guest count and one price');
  const hotelRequired = await request(app).post('/api/bookings').send({ ...bookingBody, hotelName: undefined });
  assert.equal(hotelRequired.status, 400, 'hotel name must be required for new bookings');
  const attempts = await Promise.all([request(app).post('/api/bookings').send(bookingBody), request(app).post('/api/bookings').send({ ...bookingBody, guestEmail: 'guest2@test.local' })]);
  assert.deepEqual(attempts.map((result) => result.status).sort(), [201, 409], 'concurrent requests must not oversell capacity');
  const successful = attempts.find((result) => result.status === 201)!;
  assert.equal(successful.body.data.booking.totalPrice, 140, 'date price override must be the server-side source of truth');
  const bookingId = successful.body.data.booking.id;
  const wrongPaymentToken = await request(app).post('/api/payments/create-intent').send({ bookingId, provider: 'STRIPE', paymentAccessToken: 'wrong-token-that-is-deliberately-long' });
  assert.equal(wrongPaymentToken.status, 403, 'payment creation must verify ownership/token before provider access');

  const payment = await prisma.payment.create({
    data: { bookingId, provider: 'STRIPE', providerPaymentId: 'pi_integration_webhook', amount: successful.body.data.booking.totalPrice, currency: 'EUR' },
  });
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  const eventPayload = JSON.stringify({
    id: 'evt_integration_idempotency', object: 'event', api_version: '2023-10-16', created: Math.floor(Date.now() / 1000),
    data: { object: { id: 'pi_integration_webhook', object: 'payment_intent' } }, livemode: false,
    pending_webhooks: 1, request: null, type: 'payment_intent.succeeded',
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: eventPayload, secret: process.env.STRIPE_WEBHOOK_SECRET! });
  const webhookOnce = await request(app).post('/api/payments/webhook/stripe').set('Content-Type', 'application/json').set('stripe-signature', signature).send(eventPayload);
  const webhookTwice = await request(app).post('/api/payments/webhook/stripe').set('Content-Type', 'application/json').set('stripe-signature', signature).send(eventPayload);
  assert.equal(webhookOnce.status, 200, webhookOnce.body?.message);
  assert.equal(webhookTwice.status, 200, webhookTwice.body?.message);
  assert.equal(webhookTwice.body.duplicate, true, 'replayed Stripe event must be acknowledged without reprocessing');
  assert.equal(await prisma.paymentWebhookEvent.count({ where: { provider: 'STRIPE', eventId: 'evt_integration_idempotency' } }), 1);
  assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status, 'COMPLETED');

  const firstCancel = await request(app).patch(`/api/admin/bookings/${bookingId}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'CANCELLED' });
  assert.equal(firstCancel.status, 200);
  const secondCancel = await request(app).patch(`/api/admin/bookings/${bookingId}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'CANCELLED' });
  assert.equal(secondCancel.status, 200);
  let row = await prisma.availability.findUniqueOrThrow({ where: { tourId_date: { tourId, date: new Date(`${date}T00:00:00.000Z`) } } });
  assert.equal(row.seatsAvailable, 2, 'repeated cancellation must restore seats only once');
  const reactivate = await request(app).patch(`/api/admin/bookings/${bookingId}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'CONFIRMED' });
  assert.equal(reactivate.status, 200);
  row = await prisma.availability.findUniqueOrThrow({ where: { tourId_date: { tourId, date: new Date(`${date}T00:00:00.000Z`) } } });
  assert.equal(row.seatsAvailable, 0, 'leaving CANCELLED must atomically reserve seats again');

  await prisma.promoCode.create({ data: { code: 'EXPIRED', type: 'PERCENT', value: 10, endsAt: new Date(Date.now() - 86400000) } });
  await prisma.availability.update({ where: { tourId_date: { tourId, date: new Date(`${date}T00:00:00.000Z`) } }, data: { seatsAvailable: 2 } });
  const expired = await request(app).post('/api/bookings').send({ ...bookingBody, adults: 1, guestEmail: 'promo@test.local', promoCode: 'EXPIRED' });
  assert.equal(expired.status, 400, 'expired promo code must be rejected');

  await prisma.promoCode.create({ data: { code: 'ONEUSE', type: 'PERCENT', value: 10, maxUses: 1 } });
  const limitedAttempts = await Promise.all([
    request(app).post('/api/bookings').send({ ...bookingBody, adults: 1, guestEmail: 'limited1@test.local', promoCode: 'ONEUSE' }),
    request(app).post('/api/bookings').send({ ...bookingBody, adults: 1, guestEmail: 'limited2@test.local', promoCode: 'ONEUSE' }),
  ]);
  assert.equal(limitedAttempts.filter((result) => result.status === 201).length, 1, 'promo maxUses must be claimed atomically');
  assert.equal((await prisma.promoCode.findUniqueOrThrow({ where: { code: 'ONEUSE' } })).usedCount, 1);

  const renamed = await request(app).put(`/api/admin/tours/${tourId}`).set('Authorization', `Bearer ${adminToken}`).send({ ...tourPayload, slug: 'integration-test-tour-renamed' });
  assert.equal(renamed.status, 200);
  const alias = await request(app).get('/api/tours/integration-test-tour?locale=en');
  assert.equal(alias.status, 200);
  assert.equal(alias.body.meta.canonicalSlug, 'integration-test-tour-renamed', 'old slug must resolve to the canonical tour');

  console.log('PASS admin authorization');
  console.log('PASS live translated catalog and consistent discounted pricing');
  console.log('PASS route ordering and slug alias');
  console.log('PASS concurrent capacity protection');
  console.log('PASS idempotent cancellation and safe reactivation');
  console.log('PASS date-specific price, promo validity/limits, and payment access checks');
  console.log('PASS signed and idempotent Stripe webhook handling');
  const { redis } = await import('../src/lib/redis');
  redis.disconnect();
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exit(1); });
