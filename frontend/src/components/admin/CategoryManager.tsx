'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Category = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { tours: number };
};

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'Categories could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addCategory() {
    setCreating(true);
    try {
      const response = await api.post('/admin/categories', {
        name: 'New category',
        sortOrder: categories.length,
        isActive: false,
      });
      setCategories((prev) => [...prev, response.data.data]);
    } catch (error: any) {
      toast.error(extractError(error, 'Category could not be created.'));
    } finally {
      setCreating(false);
    }
  }

  async function saveCategory(id: string, patch: Partial<Category>) {
    setSavingId(id);
    try {
      const response = await api.patch(`/admin/categories/${id}`, patch);
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...response.data.data } : c)));
    } catch (error: any) {
      toast.error(extractError(error, 'Category could not be saved.'));
    } finally {
      setSavingId(null);
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm('Delete this category?')) return;
    setSavingId(id);
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(extractError(error, 'Category could not be deleted.'));
    } finally {
      setSavingId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setCategories(reordered);
    await Promise.all([
      api.patch(`/admin/categories/${a.id}`, { sortOrder: b.sortOrder }),
      api.patch(`/admin/categories/${b.id}`, { sortOrder: a.sortOrder }),
    ]).catch((error: any) => {
      toast.error(extractError(error, 'Could not reorder categories.'));
      load();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Powers the homepage &quot;browse by category&quot; section and the filters on /tours. Only visible categories
            with at least one active tour appear on the site.
          </p>
        </div>
        <button onClick={addCategory} disabled={creating} className="btn-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-sm">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : categories.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">No categories yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              busy={savingId === category.id}
              onSave={(patch) => saveCategory(category.id, patch)}
              onDelete={() => deleteCategory(category.id)}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={index < categories.length - 1 ? () => move(index, 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  category: Category;
  busy: boolean;
  onSave: (patch: Partial<Category>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirty = name !== category.name || slug !== category.slug;
  const tourCount = category._count?.tours ?? 0;

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('images', file);
      const response = await api.post('/admin/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSave({ imageUrl: response.data.data.secureUrl });
    } catch (error: any) {
      toast.error(extractError(error, 'Image could not be uploaded.'));
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
        title="Click to change the cover image"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        ) : category.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5 text-gray-400" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); e.target.value = ''; }}
      />

      <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-gray-500">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-glass mt-1" />
        </label>
        <label className="text-xs text-gray-500">Slug (URL)
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input-glass mt-1" />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {tourCount > 0 && <span className="text-xs text-gray-400 dark:text-white/40">{tourCount} tour{tourCount === 1 ? '' : 's'}</span>}
        {dirty && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ name, slug })}
            className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        )}
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move up"><ChevronUp className="h-4 w-4" /></button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move down"><ChevronDown className="h-4 w-4" /></button>
        <button
          type="button"
          onClick={() => onSave({ isActive: !category.isActive })}
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs dark:border-white/10"
          title={category.isActive ? 'Visible on site — click to hide' : 'Hidden — click to show'}
        >
          {category.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
        </button>
        <button type="button" onClick={onDelete} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
