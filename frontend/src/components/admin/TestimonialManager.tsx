'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Testimonial = {
  id: string;
  authorName: string;
  authorLocation: string | null;
  rating: number;
  quote: string;
  tourName: string | null;
  sortOrder: number;
  isActive: boolean;
};

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/testimonials');
      setItems(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'Reviews could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addTestimonial() {
    setCreating(true);
    try {
      const response = await api.post('/admin/testimonials', {
        authorName: 'Guest name',
        rating: 5,
        quote: 'Paste the guest\'s feedback here — WhatsApp message, email, or what they told you in person.',
        sortOrder: items.length,
        isActive: false,
      });
      setItems((prev) => [...prev, response.data.data]);
    } catch (error: any) {
      toast.error(extractError(error, 'Review could not be created.'));
    } finally {
      setCreating(false);
    }
  }

  async function saveItem(id: string, patch: Partial<Testimonial>) {
    setSavingId(id);
    try {
      const response = await api.patch(`/admin/testimonials/${id}`, patch);
      setItems((prev) => prev.map((i) => (i.id === id ? response.data.data : i)));
    } catch (error: any) {
      toast.error(extractError(error, 'Review could not be saved.'));
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm('Delete this review?')) return;
    setSavingId(id);
    try {
      await api.delete(`/admin/testimonials/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Review deleted');
    } catch (error: any) {
      toast.error(extractError(error, 'Review could not be deleted.'));
    } finally {
      setSavingId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    await Promise.all([
      api.patch(`/admin/testimonials/${a.id}`, { sortOrder: b.sortOrder }),
      api.patch(`/admin/testimonials/${b.id}`, { sortOrder: a.sortOrder }),
    ]).catch((error: any) => {
      toast.error(extractError(error, 'Could not reorder reviews.'));
      load();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Guest Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Powers the &quot;Guest reviews&quot; section on the homepage. Only visible reviews appear on the site.
          </p>
        </div>
        <button onClick={addTestimonial} disabled={creating} className="btn-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-sm">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add review
        </button>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Only enter feedback you actually received from real guests (WhatsApp, email, in person). Publishing invented reviews is deceptive advertising and can violate consumer-protection law — don&apos;t use this for made-up quotes.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">No reviews yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <TestimonialRow
              key={item.id}
              item={item}
              busy={savingId === item.id}
              onSave={(patch) => saveItem(item.id, patch)}
              onDelete={() => deleteItem(item.id)}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={index < items.length - 1 ? () => move(index, 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialRow({
  item,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: Testimonial;
  busy: boolean;
  onSave: (patch: Partial<Testimonial>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [authorName, setAuthorName] = useState(item.authorName);
  const [authorLocation, setAuthorLocation] = useState(item.authorLocation || '');
  const [tourName, setTourName] = useState(item.tourName || '');
  const [quote, setQuote] = useState(item.quote);
  const [rating, setRating] = useState(item.rating);
  const dirty =
    authorName !== item.authorName ||
    authorLocation !== (item.authorLocation || '') ||
    tourName !== (item.tourName || '') ||
    quote !== item.quote ||
    rating !== item.rating;

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
              <Star className={`h-5 w-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-white/20'}`} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move up"><ChevronUp className="h-4 w-4" /></button>
          <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move down"><ChevronDown className="h-4 w-4" /></button>
          <button
            type="button"
            onClick={() => onSave({ isActive: !item.isActive })}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs dark:border-white/10"
            title={item.isActive ? 'Visible on site — click to hide' : 'Hidden — click to show'}
          >
            {item.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
            {item.isActive ? 'Visible' : 'Hidden'}
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-gray-500">Guest name
          <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="input-glass mt-1" />
        </label>
        <label className="text-xs text-gray-500">Location (optional)
          <input value={authorLocation} onChange={(e) => setAuthorLocation(e.target.value)} className="input-glass mt-1" placeholder="e.g. London, UK" />
        </label>
        <label className="text-xs text-gray-500">Tour (optional)
          <input value={tourName} onChange={(e) => setTourName(e.target.value)} className="input-glass mt-1" placeholder="e.g. Balloon Flight" />
        </label>
      </div>
      <label className="mt-3 block text-xs text-gray-500">Review
        <textarea rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} className="input-glass mt-1" />
      </label>

      {dirty && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => { setAuthorName(item.authorName); setAuthorLocation(item.authorLocation || ''); setTourName(item.tourName || ''); setQuote(item.quote); setRating(item.rating); }}
            className="rounded-lg border px-3 py-1.5 text-xs dark:border-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ authorName, authorLocation: authorLocation || null, tourName: tourName || null, quote, rating })}
            className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      )}
    </div>
  );
}
