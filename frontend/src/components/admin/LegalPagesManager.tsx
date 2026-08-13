'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Plus, Table as TableIcon, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Table = { head: string[]; rows: string[][] };
type Section = { title: string; body?: string; list?: string[]; table?: Table; footnote?: string };
type LegalPage = { id: string; slug: string; title: string; intro: string; sections: Section[]; updatedAt: string };

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

const blankSection = (): Section => ({ title: 'New section', body: '' });

export function LegalPagesManager() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LegalPage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/legal');
      setPages(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'Legal pages could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Legal Pages</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
          These six documents power the &quot;Customer support&quot; footer links. Edits here go live on the site immediately.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.slug} className="glass-card flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{page.title}</h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-white/40">
                  /legal/{page.slug} · updated {new Date(page.updatedAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setEditing(page)} className="btn-primary shrink-0 !px-5 !py-2.5 text-sm">Edit</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <LegalPageEditor
          page={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setPages((prev) => prev.map((p) => (p.slug === saved.slug ? saved : p)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function LegalPageEditor({ page, onClose, onSaved }: { page: LegalPage; onClose: () => void; onSaved: (page: LegalPage) => void }) {
  const [title, setTitle] = useState(page.title);
  const [intro, setIntro] = useState(page.intro);
  const [sections, setSections] = useState<Section[]>(() => page.sections.map((s) => ({ ...s, list: s.list ? [...s.list] : undefined, table: s.table ? { head: [...s.table.head], rows: s.table.rows.map((r) => [...r]) } : undefined })));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function close() { if (dirty && !window.confirm('Discard unsaved changes?')) return; onClose(); }

  function updateSection(index: number, patch: Partial<Section>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    setDirty(true);
  }

  function addSection() { setSections((prev) => [...prev, blankSection()]); setDirty(true); }
  function removeSection(index: number) {
    if (!window.confirm('Remove this section?')) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }
  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }

  function toggleTable(index: number) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index) return s;
      if (s.table) { const rest = { ...s }; delete rest.table; return rest; }
      return { ...s, table: { head: ['Column 1', 'Column 2'], rows: [['', '']] } };
    }));
    setDirty(true);
  }

  function addTableColumn(index: number) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { head: [...s.table.head, `Column ${s.table.head.length + 1}`], rows: s.table.rows.map((r) => [...r, '']) } };
    }));
    setDirty(true);
  }
  function removeTableColumn(index: number, col: number) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { head: s.table.head.filter((_, c) => c !== col), rows: s.table.rows.map((r) => r.filter((_, c) => c !== col)) } };
    }));
    setDirty(true);
  }
  function addTableRow(index: number) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { ...s.table, rows: [...s.table.rows, s.table.head.map(() => '')] } };
    }));
    setDirty(true);
  }
  function removeTableRow(index: number, row: number) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { ...s.table, rows: s.table.rows.filter((_, r) => r !== row) } };
    }));
    setDirty(true);
  }
  function updateTableHead(index: number, col: number, value: string) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { ...s.table, head: s.table.head.map((c, ci) => (ci === col ? value : c)) } };
    }));
    setDirty(true);
  }
  function updateTableCell(index: number, row: number, col: number, value: string) {
    setSections((prev) => prev.map((s, i) => {
      if (i !== index || !s.table) return s;
      return { ...s, table: { ...s.table, rows: s.table.rows.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r)) } };
    }));
    setDirty(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        intro,
        sections: sections.map((s) => ({
          title: s.title,
          body: s.body || null,
          list: s.list && s.list.length ? s.list : undefined,
          table: s.table,
          footnote: s.footnote || null,
        })),
      };
      const response = await api.put(`/admin/legal/${page.slug}`, payload);
      toast.success('Page updated');
      setDirty(false);
      onSaved(response.data.data);
    } catch (error: any) {
      toast.error(extractError(error, 'Page could not be saved'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}>
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-dark-50" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Edit legal page</h2>
            <p className="text-sm text-gray-500">/legal/{page.slug} — changes are visible on the site as soon as you save.</p>
          </div>
          <button onClick={close} aria-label="Close"><X /></button>
        </div>

        <form onSubmit={save} className="space-y-7">
          <section className="rounded-2xl border p-5 dark:border-white/10">
            <label className="text-xs text-gray-500">Title
              <input required value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} className="input-glass mt-1" />
            </label>
            <label className="mt-4 block text-xs text-gray-500">Intro
              <textarea required rows={3} value={intro} onChange={(e) => { setIntro(e.target.value); setDirty(true); }} className="input-glass mt-1" />
            </label>
          </section>

          <div className="space-y-5">
            {sections.map((section, index) => (
              <section key={index} className="rounded-2xl border p-5 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Section {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move up"><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="rounded-lg border p-1.5 disabled:opacity-30 dark:border-white/10" title="Move down"><ChevronDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => toggleTable(index)} className={`rounded-lg border p-1.5 dark:border-white/10 ${section.table ? 'bg-emerald-500/10 text-emerald-500' : ''}`} title="Toggle table"><TableIcon className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeSection(index)} className="rounded-lg border p-1.5 text-red-500 dark:border-white/10" title="Remove section"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <label className="text-xs text-gray-500">Section title
                  <input required value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} className="input-glass mt-1" />
                </label>

                <label className="mt-4 block text-xs text-gray-500">Body paragraph
                  <textarea rows={3} value={section.body || ''} onChange={(e) => updateSection(index, { body: e.target.value })} className="input-glass mt-1" />
                </label>

                <label className="mt-4 block text-xs text-gray-500">Bullet list — one item per line
                  <textarea rows={3} value={(section.list || []).join('\n')} onChange={(e) => updateSection(index, { list: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })} className="input-glass mt-1" />
                </label>

                {section.table && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-gray-500">Table</p>
                    <div className="overflow-x-auto rounded-xl border dark:border-white/10">
                      <table className="w-full min-w-[480px] border-collapse text-sm">
                        <thead>
                          <tr>
                            {section.table.head.map((cell, col) => (
                              <th key={col} className="border-b p-2 dark:border-white/10">
                                <div className="flex items-center gap-1">
                                  <input value={cell} onChange={(e) => updateTableHead(index, col, e.target.value)} className="input-glass !py-1.5 text-xs font-bold" />
                                  <button type="button" onClick={() => removeTableColumn(index, col)} className="shrink-0 text-red-400" title="Remove column"><X className="h-3.5 w-3.5" /></button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {row.map((cell, col) => (
                                <td key={col} className="border-b p-2 dark:border-white/10">
                                  <input value={cell} onChange={(e) => updateTableCell(index, rowIdx, col, e.target.value)} className="input-glass !py-1.5 text-xs" />
                                </td>
                              ))}
                              <td className="border-b p-2 dark:border-white/10">
                                <button type="button" onClick={() => removeTableRow(index, rowIdx)} className="text-red-400" title="Remove row"><Trash2 className="h-3.5 w-3.5" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => addTableColumn(index)} className="rounded-lg border px-3 py-1.5 text-xs dark:border-white/10">+ Column</button>
                      <button type="button" onClick={() => addTableRow(index)} className="rounded-lg border px-3 py-1.5 text-xs dark:border-white/10">+ Row</button>
                    </div>
                  </div>
                )}

                <label className="mt-4 block text-xs text-gray-500">Footnote (small print under the section)
                  <textarea rows={2} value={section.footnote || ''} onChange={(e) => updateSection(index, { footnote: e.target.value })} className="input-glass mt-1" />
                </label>
              </section>
            ))}
          </div>

          <button type="button" onClick={addSection} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm text-gray-500 dark:border-white/10"><Plus className="h-4 w-4" />Add section</button>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white/95 py-4 dark:border-white/10 dark:bg-dark-50/95">
            <button type="button" onClick={close} className="rounded-xl border px-5 py-3">Cancel</button>
            <button disabled={saving} className="btn-primary inline-flex items-center gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
