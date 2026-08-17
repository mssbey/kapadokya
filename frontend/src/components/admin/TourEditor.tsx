'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, GripVertical, ImagePlus, Loader2, Plus, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { TourPriceCalendar } from '@/components/admin/TourPriceCalendar';

const LOCALES = ['en', 'tr', 'es', 'it', 'ru'] as const;
const NAMES = { en: 'English', tr: 'Türkçe', es: 'Español', it: 'Italiano', ru: 'Русский' };
type Locale = typeof LOCALES[number];

type Translation = { locale: Locale; title: string; shortDesc: string; description: string; highlights: string[]; includes: string[]; excludes: string[]; meetingPoint: string; cancellationPolicy: string; seoTitle: string; seoDescription: string };
const blankTranslation = (locale: Locale): Translation => ({ locale, title: '', shortDesc: '', description: '', highlights: [], includes: [], excludes: [], meetingPoint: '', cancellationPolicy: '', seoTitle: '', seoDescription: '' });
const lines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);

type VariantRow = { id?: string; name: string; description: string; priceDelta: number | string; icon: string; isActive: boolean; sortOrder: number };
const blankVariant = (sortOrder: number): VariantRow => ({ name: '', description: '', priceDelta: 0, icon: '', isActive: true, sortOrder });

export function TourEditor({ tour, onClose, onSaved }: { tour: any | null; onClose: () => void; onSaved: (tour: any) => void }) {
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    api.get('/admin/categories').then((response) => {
      setCategories(response.data.data);
      // New tours have no category yet — default to the first one once the list loads.
      if (!tour?.category?.id) setForm((previous) => (previous.categoryId ? previous : { ...previous, categoryId: response.data.data[0]?.id || '' }));
    }).catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState(() => ({
    slug: tour?.slug || '', categoryId: tour?.category?.id || '', tourType: tour?.tourType || 'GROUP',
    basePrice: tour?.basePrice ?? 1, discountedPrice: tour?.discountedPrice ?? '', currency: tour?.currency || 'EUR',
    childPriceRate: tour?.childPriceRate ?? .5, privatePriceMultiplier: tour?.privatePriceMultiplier ?? 1.5,
    duration: tour?.duration || '', startTime: tour?.startTime || '', endTime: tour?.endTime || '',
    maxCapacity: tour?.maxCapacity ?? 20, minParticipants: tour?.minParticipants ?? 1, defaultCapacity: tour?.defaultCapacity ?? tour?.maxCapacity ?? 20,
    videoUrl: tour?.videoUrl || '', isActive: tour?.isActive ?? false, isFeatured: tour?.isFeatured ?? false,
    isBookingEnabled: tour?.isBookingEnabled ?? true, sortOrder: tour?.sortOrder ?? 0,
  }));
  const [translations, setTranslations] = useState<Record<Locale, Translation>>(() => Object.fromEntries(LOCALES.map((locale) => {
    const existing = tour?.translations?.find((item: any) => item.locale === locale);
    return [locale, existing ? {
      ...blankTranslation(locale), ...existing,
      meetingPoint: existing.meetingPoint ?? '', cancellationPolicy: existing.cancellationPolicy ?? '',
      seoTitle: existing.seoTitle ?? '', seoDescription: existing.seoDescription ?? '',
    } : blankTranslation(locale)];
  })) as Record<Locale, Translation>);
  const [media, setMedia] = useState<any[]>(tour?.media || []);
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    (tour?.variants || []).map((v: any) => ({ id: v.id, name: v.name, description: v.description || '', priceDelta: v.priceDelta, icon: v.icon || '', isActive: v.isActive, sortOrder: v.sortOrder })),
  );
  const current = translations[activeLocale];
  const exists = Boolean(tour?.id);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload); return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const payload = useMemo(() => ({
    ...form,
    basePrice: Number(form.basePrice), discountedPrice: form.discountedPrice === '' ? null : Number(form.discountedPrice),
    childPriceRate: Number(form.childPriceRate), privatePriceMultiplier: Number(form.privatePriceMultiplier),
    maxCapacity: Number(form.maxCapacity), minParticipants: Number(form.minParticipants), defaultCapacity: Number(form.defaultCapacity), sortOrder: Number(form.sortOrder),
    startTime: form.startTime || null, endTime: form.endTime || null, videoUrl: form.videoUrl || null,
    translations: LOCALES.map((locale) => translations[locale]).filter((item) => item.locale === 'en' || item.title.trim()).map((item) => ({ ...item, meetingPoint: item.meetingPoint || null, cancellationPolicy: item.cancellationPolicy || null, seoTitle: item.seoTitle || null, seoDescription: item.seoDescription || null })),
    upsells: tour?.upsells || [],
    variants: variants.map((v) => ({ ...v, priceDelta: Number(v.priceDelta) || 0, description: v.description || null, icon: v.icon || null })),
  }), [form, translations, tour?.upsells, variants]);

  function changeForm(key: string, value: any) { setForm((previous) => ({ ...previous, [key]: value })); setDirty(true); }
  function changeTranslation(key: keyof Translation, value: any) { setTranslations((previous) => ({ ...previous, [activeLocale]: { ...previous[activeLocale], [key]: value } })); setDirty(true); }
  function addVariant() { setVariants((previous) => [...previous, blankVariant(previous.length)]); setDirty(true); }
  function changeVariant(index: number, key: keyof VariantRow, value: any) { setVariants((previous) => previous.map((row, i) => (i === index ? { ...row, [key]: value } : row))); setDirty(true); }
  function removeVariant(index: number) { setVariants((previous) => previous.filter((_, i) => i !== index)); setDirty(true); }
  function close() { if (dirty && !window.confirm('Discard unsaved changes?')) return; onClose(); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = exists ? await api.put(`/admin/tours/${tour.id}`, payload) : await api.post('/admin/tours', payload);
      toast.success(exists ? 'Tour updated' : 'Tour created'); setDirty(false); onSaved(response.data.data);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Tour could not be saved'); }
    finally { setSaving(false); }
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!exists) return toast.error('Save the tour before uploading images.');
    const selected = Array.from(files);
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) return toast.error('Only JPG, PNG and WebP files are accepted.');
    if (selected.some((file) => file.size > 8 * 1024 * 1024)) return toast.error('Each image must be 8 MB or smaller.');
    const body = new FormData(); selected.forEach((file) => body.append('images', file));
    setUploading(true); setUploadProgress(0);
    try {
      const response = await api.post(`/admin/tours/${tour.id}/images`, body, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: (progress) => setUploadProgress(progress.total ? Math.round(progress.loaded / progress.total * 100) : 0) });
      setMedia((previous) => [...previous, ...response.data.data]); toast.success(`${selected.length} image(s) uploaded`);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Image upload failed'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  }

  async function persistOrder(next: any[], coverId = next.find((item) => item.isCover)?.id || next[0]?.id) {
    const response = await api.patch(`/admin/tours/${tour.id}/images/reorder`, { imageIds: next.map((item) => item.id), coverId }); setMedia(response.data.data);
  }
  async function makeCover(id: string) { try { await persistOrder(media, id); toast.success('Cover image updated'); } catch (error: any) { toast.error(error.response?.data?.message || 'Could not set cover'); } }
  async function removeImage(id: string) { if (!window.confirm('Delete this image from the tour and storage?')) return; try { await api.delete(`/admin/tours/${tour.id}/images/${id}`); setMedia((previous) => previous.filter((item) => item.id !== id)); toast.success('Image deleted'); } catch (error: any) { toast.error(error.response?.data?.message || 'Image could not be deleted'); } }
  async function updateAlt(id: string, altText: string) { try { await api.patch(`/admin/tours/${tour.id}/images/${id}`, { altText }); setMedia((previous) => previous.map((item) => item.id === id ? { ...item, altText } : item)); } catch (error: any) { toast.error(error.response?.data?.message || 'Alt text could not be saved'); } }
  async function dropOn(targetId: string) { if (!dragId || dragId === targetId) return; const next = [...media]; const from = next.findIndex((item) => item.id === dragId); const to = next.findIndex((item) => item.id === targetId); const [item] = next.splice(from, 1); next.splice(to, 0, item); setDragId(null); try { await persistOrder(next); } catch { toast.error('Image order could not be saved'); } }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}><div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-dark-50" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">{exists ? 'Edit tour' : 'New tour'}</h2><p className="text-sm text-gray-500">All published fields are served from PostgreSQL.</p></div><button onClick={close} aria-label="Close"><X /></button></div><form onSubmit={save} className="space-y-7">
    <section className="rounded-2xl border p-5 dark:border-white/10"><h3 className="mb-4 font-bold">Publishing and pricing</h3><div className="grid gap-4 md:grid-cols-4">{[['slug','Slug'],['duration','Duration'],['startTime','Start time'],['endTime','End time']].map(([key,label]) => <label key={key} className="text-xs text-gray-500">{label}<input required={key === 'slug' || key === 'duration'} value={(form as any)[key]} onChange={(event) => changeForm(key,event.target.value)} className="input-glass mt-1" /></label>)}<label className="text-xs text-gray-500">Category<select value={form.categoryId} onChange={(event) => changeForm('categoryId',event.target.value)} className="input-glass mt-1">{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs text-gray-500">Type<select value={form.tourType} onChange={(event) => changeForm('tourType',event.target.value)} className="input-glass mt-1"><option>GROUP</option><option>PRIVATE</option><option>PACKAGE</option><option>TRANSFER</option><option>ACTIVITY</option></select></label>{[['basePrice','Base price'],['discountedPrice','Discount price'],['currency','Currency'],['childPriceRate','Child rate'],['privatePriceMultiplier','Private multiplier'],['maxCapacity','Max capacity'],['minParticipants','Min guests'],['defaultCapacity','Daily capacity'],['sortOrder','Sort']].map(([key,label]) => <label key={key} className="text-xs text-gray-500">{label}<input type={key === 'currency' ? 'text' : 'number'} step="0.01" value={(form as any)[key]} onChange={(event) => changeForm(key,event.target.value)} className="input-glass mt-1" /></label>)}</div><div className="mt-5 flex flex-wrap gap-5">{[['isActive','Published'],['isFeatured','Featured'],['isBookingEnabled','Booking open']].map(([key,label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(form as any)[key]} onChange={(event) => changeForm(key,event.target.checked)} />{label}</label>)}</div></section>
    <section className="rounded-2xl border p-5 dark:border-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Route / class options</h3>
          <p className="text-xs text-gray-500">Optional — shown as a pick-one choice once a customer selects a date. Leave empty for tours that don&apos;t need this (most tours).</p>
        </div>
        <button type="button" onClick={addVariant} className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"><Plus className="h-3.5 w-3.5" />Add option</button>
      </div>
      {variants.length === 0 && <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/5">No options — the booking calendar will skip straight to guest count.</p>}
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={variant.id || index} className="grid gap-2 rounded-xl border p-3 dark:border-white/10 md:grid-cols-12 md:items-start">
            <label className="text-xs text-gray-500 md:col-span-3">Name<input value={variant.name} onChange={(event) => changeVariant(index, 'name', event.target.value)} placeholder="e.g. Comfort Class" className="input-glass mt-1" /></label>
            <label className="text-xs text-gray-500 md:col-span-4">Description (optional)<input value={variant.description} onChange={(event) => changeVariant(index, 'description', event.target.value)} className="input-glass mt-1" /></label>
            <label className="text-xs text-gray-500 md:col-span-2">Price difference<input type="number" step="0.01" value={variant.priceDelta} onChange={(event) => changeVariant(index, 'priceDelta', event.target.value)} placeholder="0" className="input-glass mt-1" /></label>
            <label className="text-xs text-gray-500 md:col-span-1">Icon<input value={variant.icon} onChange={(event) => changeVariant(index, 'icon', event.target.value)} placeholder="🎈" className="input-glass mt-1" /></label>
            <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end md:pt-5">
              <label className="flex items-center gap-1.5 text-xs text-gray-500"><input type="checkbox" checked={variant.isActive} onChange={(event) => changeVariant(index, 'isActive', event.target.checked)} />Active</label>
              <button type="button" onClick={() => removeVariant(index)} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
    {exists ? <TourPriceCalendar tour={{ id: tour.id, title: current.title || tour.title, basePrice: Number(form.basePrice), currency: form.currency }} /> : <section className="rounded-2xl border border-dashed p-5 text-sm text-gray-500 dark:border-white/10">Gelecek fiyat takvimini kullanmak için önce turu kaydedin.</section>}
    <section className="rounded-2xl border p-5 dark:border-white/10"><div className="mb-5 flex gap-2 overflow-x-auto">{LOCALES.map((locale) => <button type="button" key={locale} onClick={() => setActiveLocale(locale)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeLocale === locale ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/5'}`}>{NAMES[locale]}{translations[locale].title && <Check className="ml-1 inline h-3 w-3" />}</button>)}</div>{activeLocale !== 'en' && !current.title && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="mr-2 inline h-4 w-4" />Empty translations safely fall back to English.</p>}<div className="grid gap-4 md:grid-cols-2"><label className="text-xs text-gray-500">Title<input required={activeLocale === 'en'} value={current.title} onChange={(event) => changeTranslation('title',event.target.value)} className="input-glass mt-1" /></label><label className="text-xs text-gray-500">SEO title<input value={current.seoTitle} onChange={(event) => changeTranslation('seoTitle',event.target.value)} className="input-glass mt-1" maxLength={70} /></label><label className="md:col-span-2 text-xs text-gray-500">Short description<input required={activeLocale === 'en'} value={current.shortDesc} onChange={(event) => changeTranslation('shortDesc',event.target.value)} className="input-glass mt-1" /></label><label className="md:col-span-2 text-xs text-gray-500">Description<textarea required={activeLocale === 'en'} rows={4} value={current.description} onChange={(event) => changeTranslation('description',event.target.value)} className="input-glass mt-1" /></label>{[['highlights','Highlights'],['includes','Included'],['excludes','Not included']].map(([key,label]) => <label key={key} className="text-xs text-gray-500">{label} — one per line<textarea rows={4} value={(current as any)[key].join('\n')} onChange={(event) => changeTranslation(key as keyof Translation,lines(event.target.value))} className="input-glass mt-1" /></label>)}<label className="text-xs text-gray-500">Meeting point<textarea rows={4} value={current.meetingPoint} onChange={(event) => changeTranslation('meetingPoint',event.target.value)} className="input-glass mt-1" /></label><label className="md:col-span-2 text-xs text-gray-500">Cancellation policy<textarea rows={3} value={current.cancellationPolicy} onChange={(event) => changeTranslation('cancellationPolicy',event.target.value)} className="input-glass mt-1" /></label><label className="md:col-span-2 text-xs text-gray-500">SEO description<textarea rows={2} maxLength={170} value={current.seoDescription} onChange={(event) => changeTranslation('seoDescription',event.target.value)} className="input-glass mt-1" /></label></div></section>
    <section className="rounded-2xl border p-5 dark:border-white/10"><div className="flex items-center justify-between"><div><h3 className="font-bold">Gallery</h3><p className="text-xs text-gray-500">JPG, PNG or WebP · max 8 MB each · drag to reorder</p></div><input ref={inputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files && uploadFiles(event.target.files)} /><button disabled={!exists || uploading} type="button" onClick={() => inputRef.current?.click()} className="btn-primary inline-flex items-center gap-2 text-sm"><ImagePlus className="h-4 w-4" />Upload images</button></div>{uploading && <div className="mt-4"><div className="h-2 overflow-hidden rounded bg-gray-100"><div className="h-full bg-emerald-500" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-1 text-xs">Uploading {uploadProgress}%</p></div>}<div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files); }} className="mt-4 min-h-24 rounded-2xl border-2 border-dashed p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{media.map((image) => <div key={image.id} draggable onDragStart={() => setDragId(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOn(image.id)} className="rounded-xl border p-2 dark:border-white/10"><div className="relative h-36 overflow-hidden rounded-lg"><img src={image.secureUrl} alt={image.altText || ''} className="h-full w-full object-cover" /><GripVertical className="absolute left-2 top-2 rounded bg-white/90 p-1 text-gray-700" />{image.isCover && <span className="absolute bottom-2 left-2 rounded bg-emerald-600 px-2 py-1 text-xs text-white">Cover</span>}</div><input defaultValue={image.altText || ''} onBlur={(event) => updateAlt(image.id,event.target.value)} placeholder="Alt text" className="input-glass mt-2 !py-2 text-xs" /><div className="mt-2 flex gap-2"><button type="button" onClick={() => makeCover(image.id)} className="flex-1 rounded-lg border p-2 text-xs"><Star className="mr-1 inline h-3 w-3" />Cover</button><button type="button" onClick={() => removeImage(image.id)} className="rounded-lg border p-2 text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>{!exists && <p className="py-6 text-center text-sm text-gray-500">Save the tour first to enable persistent Cloudinary uploads.</p>}{exists && media.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Drop images here or select files.</p>}</div></section>
    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white/95 py-4 dark:border-white/10 dark:bg-dark-50/95"><button type="button" onClick={close} className="rounded-xl border px-5 py-3">Cancel</button><button disabled={saving} className="btn-primary inline-flex items-center gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{exists ? 'Save changes' : 'Create tour'}</button></div>
  </form></div></div>;
}
