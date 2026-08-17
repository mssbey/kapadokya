'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Partner = { id: string; name: string; logoUrl: string; websiteUrl: string | null; sortOrder: number; isActive: boolean };

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/partners');
      setPartners(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'Partners could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addPartner() {
    setCreating(true);
    try {
      const response = await api.post('/admin/partners', {
        name: 'New partner',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        sortOrder: partners.length,
        isActive: false,
      });
      setPartners((prev) => [...prev, response.data.data]);
    } catch (error: any) {
      toast.error(extractError(error, 'Partner could not be created.'));
    } finally {
      setCreating(false);
    }
  }

  async function savePartner(id: string, patch: Partial<Partner>) {
    setSavingId(id);
    try {
      const response = await api.patch(`/admin/partners/${id}`, patch);
      setPartners((prev) => prev.map((p) => (p.id === id ? response.data.data : p)));
    } catch (error: any) {
      toast.error(extractError(error, 'Partner could not be saved.'));
    } finally {
      setSavingId(null);
    }
  }

  async function deletePartner(id: string) {
    if (!window.confirm('Delete this partner?')) return;
    setSavingId(id);
    try {
      await api.delete(`/admin/partners/${id}`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success('Partner deleted');
    } catch (error: any) {
      toast.error(extractError(error, 'Partner could not be deleted.'));
    } finally {
      setSavingId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= partners.length) return;
    const a = partners[index];
    const b = partners[target];
    const reordered = [...partners];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPartners(reordered);
    await Promise.all([
      api.patch(`/admin/partners/${a.id}`, { sortOrder: b.sortOrder }),
      api.patch(`/admin/partners/${b.id}`, { sortOrder: a.sortOrder }),
    ]).catch((error: any) => {
      toast.error(extractError(error, 'Could not reorder partners.'));
      load();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Partners</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Powers the &quot;Our partners&quot; logo strip on the homepage. Only visible partners appear on the site.
          </p>
        </div>
        <button onClick={addPartner} disabled={creating} className="btn-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-sm">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add partner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : partners.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">No partners yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {partners.map((partner, index) => (
            <PartnerRow
              key={partner.id}
              partner={partner}
              busy={savingId === partner.id}
              onSave={(patch) => savePartner(partner.id, patch)}
              onDelete={() => deletePartner(partner.id)}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={index < partners.length - 1 ? () => move(index, 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerRow({
  partner,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  partner: Partner;
  busy: boolean;
  onSave: (patch: Partial<Partner>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [name, setName] = useState(partner.name);
  const [logoUrl, setLogoUrl] = useState(partner.logoUrl);
  const [websiteUrl, setWebsiteUrl] = useState(partner.websiteUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirty = name !== partner.name || logoUrl !== partner.logoUrl || websiteUrl !== (partner.websiteUrl || '');

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('images', file);
      const response = await api.post('/admin/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const secureUrl = response.data.data.secureUrl;
      setLogoUrl(secureUrl);
      onSave({ logoUrl: secureUrl });
    } catch (error: any) {
      toast.error(extractError(error, 'Logo could not be uploaded.'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="glass-card flex items-center gap-4 p-5">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white dark:border-white/10"
        title="Click to upload a logo image"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        ) : logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={partner.name} className="max-h-12 max-w-12 object-contain" />
        ) : (
          <ImagePlus className="h-5 w-5 text-gray-400" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadLogo(file); e.target.value = ''; }}
      />

      <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-gray-500">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-glass mt-1" />
        </label>
        <label className="text-xs text-gray-500">Website URL (optional)
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="input-glass mt-1" placeholder="https://" />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {dirty && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ name, logoUrl, websiteUrl: websiteUrl || null })}
            className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        )}
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move up"><ChevronUp className="h-4 w-4" /></button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move down"><ChevronDown className="h-4 w-4" /></button>
        <button
          type="button"
          onClick={() => onSave({ isActive: !partner.isActive })}
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs dark:border-white/10"
          title={partner.isActive ? 'Visible on site — click to hide' : 'Hidden — click to show'}
        >
          {partner.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
        </button>
        <button type="button" onClick={onDelete} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
