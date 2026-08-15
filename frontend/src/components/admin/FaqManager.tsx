'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const LOCALES = ['en', 'tr', 'es', 'it', 'ru'] as const;
const NAMES = { en: 'English', tr: 'Türkçe', es: 'Español', it: 'Italiano', ru: 'Русский' };
type Locale = typeof LOCALES[number];

type Faq = { id: string; locale: string; question: string; answer: string; sortOrder: number; isActive: boolean };

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function FaqManager() {
  const [locale, setLocale] = useState<Locale>('en');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (loc: Locale) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/faqs', { params: { locale: loc } });
      setFaqs(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'FAQs could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(locale); }, [locale, load]);

  async function addFaq() {
    setCreating(true);
    try {
      const response = await api.post('/admin/faqs', {
        locale,
        question: 'New question',
        answer: 'New answer',
        sortOrder: faqs.length,
        isActive: true,
      });
      setFaqs((prev) => [...prev, response.data.data]);
    } catch (error: any) {
      toast.error(extractError(error, 'FAQ could not be created.'));
    } finally {
      setCreating(false);
    }
  }

  async function saveFaq(id: string, patch: Partial<Faq>) {
    setSavingId(id);
    try {
      const response = await api.patch(`/admin/faqs/${id}`, patch);
      setFaqs((prev) => prev.map((f) => (f.id === id ? response.data.data : f)));
    } catch (error: any) {
      toast.error(extractError(error, 'FAQ could not be saved.'));
    } finally {
      setSavingId(null);
    }
  }

  async function deleteFaq(id: string) {
    if (!window.confirm('Delete this question?')) return;
    setSavingId(id);
    try {
      await api.delete(`/admin/faqs/${id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success('FAQ deleted');
    } catch (error: any) {
      toast.error(extractError(error, 'FAQ could not be deleted.'));
    } finally {
      setSavingId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    const a = faqs[index];
    const b = faqs[target];
    const reordered = [...faqs];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setFaqs(reordered);
    await Promise.all([
      api.patch(`/admin/faqs/${a.id}`, { sortOrder: b.sortOrder }),
      api.patch(`/admin/faqs/${b.id}`, { sortOrder: a.sortOrder }),
    ]).catch((error: any) => {
      toast.error(extractError(error, 'Could not reorder FAQs.'));
      load(locale);
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">FAQ</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Powers the &quot;Plan with confidence&quot; accordion on the homepage. Edits go live immediately.
          </p>
        </div>
        <button onClick={addFaq} disabled={creating} className="btn-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-sm">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add question
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${locale === loc ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/5'}`}
          >
            {NAMES[loc]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : faqs.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">No questions yet for {NAMES[locale]}. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              busy={savingId === faq.id}
              onSave={(patch) => saveFaq(faq.id, patch)}
              onDelete={() => deleteFaq(faq.id)}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={index < faqs.length - 1 ? () => move(index, 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FaqRow({
  faq,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  faq: Faq;
  busy: boolean;
  onSave: (patch: Partial<Faq>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const dirty = question !== faq.question || answer !== faq.answer;

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move up"><ChevronUp className="h-4 w-4" /></button>
          <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move down"><ChevronDown className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSave({ isActive: !faq.isActive })}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs dark:border-white/10"
            title={faq.isActive ? 'Visible on site — click to hide' : 'Hidden — click to show'}
          >
            {faq.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
            {faq.isActive ? 'Visible' : 'Hidden'}
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <label className="text-xs text-gray-500">Question
        <input value={question} onChange={(e) => setQuestion(e.target.value)} className="input-glass mt-1" />
      </label>
      <label className="mt-3 block text-xs text-gray-500">Answer
        <textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-glass mt-1" />
      </label>

      {dirty && (
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={() => { setQuestion(faq.question); setAnswer(faq.answer); }} className="rounded-lg border px-3 py-1.5 text-xs dark:border-white/10">Cancel</button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ question, answer })}
            className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      )}
    </div>
  );
}
