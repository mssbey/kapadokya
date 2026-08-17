'use client';

import { useCallback, useEffect, useState } from 'react';
import { Instagram, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Settings = { instagramUrl: string | null };

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function SettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.data);
      setInstagramUrl(response.data.data.instagramUrl || '');
    } catch (error: any) {
      toast.error(extractError(error, 'Settings could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dirty = settings !== null && instagramUrl !== (settings.instagramUrl || '');

  async function save() {
    setSaving(true);
    try {
      const response = await api.patch('/admin/settings', { instagramUrl: instagramUrl.trim() || null });
      setSettings(response.data.data);
      toast.success('Settings saved');
    } catch (error: any) {
      toast.error(extractError(error, 'Settings could not be saved.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
          General site-wide settings that don&apos;t belong to a single tour or page.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : (
        <div className="glass-card max-w-xl space-y-4 p-6">
          <div>
            <h3 className="flex items-center gap-2 font-bold"><Instagram className="h-4 w-4" /> Instagram</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
              Shown as a follow button on the &quot;Fly Over Cappadocia at Sunrise&quot; homepage section. Leave empty to hide it.
            </p>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/cappadociakapheratravel"
              className="input-glass mt-3"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={save}
              className="btn-primary inline-flex items-center gap-1.5 !px-5 !py-2.5 text-sm disabled:opacity-40"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
