import { api } from './api';
import type { Availability } from '@/types';

// Matches the backend's 60s Redis TTL for the same endpoint (see
// backend/src/routes/availability.ts) so the frontend never shows a stale
// seat count longer than the source of truth already allows.
const TTL_MS = 60_000;

const cache = new Map<string, { promise: Promise<Availability[]>; time: number }>();

function keyFor(tourId: string, month: number, year: number) {
  return `${tourId}:${year}-${month}`;
}

// Deduped, TTL'd fetch shared between the tour-select step (which prefetches
// as soon as a tour is picked) and the date-select step (which reads the
// same in-flight/completed request instead of starting a fresh one). This is
// what makes the calendar feel instant: the network round trip happens
// during the step-1 -> step-2 transition instead of after it.
export function fetchAvailability(tourId: string, month: number, year: number): Promise<Availability[]> {
  const key = keyFor(tourId, month, year);
  const existing = cache.get(key);
  if (existing && Date.now() - existing.time < TTL_MS) {
    return existing.promise;
  }

  const promise = api
    .get(`/availability/${tourId}`, { params: { month, year } })
    .then((res) => res.data.data as Availability[]);

  // A failed request shouldn't poison the cache — let the next caller
  // (retry button, remount) issue a fresh request instead of replaying
  // the same rejection until the TTL expires.
  promise.catch(() => cache.delete(key));

  cache.set(key, { promise, time: Date.now() });
  return promise;
}

export function prefetchAvailability(tourId: string, month: number, year: number) {
  fetchAvailability(tourId, month, year).catch(() => {});
}
