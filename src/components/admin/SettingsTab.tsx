import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ChannelSettings } from '../../types/database'

export function SettingsTab({ settings, onChanged, notify }: { settings: ChannelSettings | null; onChanged: () => void; notify: (message: string) => void }) {
  const [form, setForm] = useState({ channel_name: '', timezone: '', logo_url: '' })
  useEffect(() => { if (settings) setForm({ channel_name: settings.channel_name, timezone: settings.timezone, logo_url: settings.logo_url ?? '' }) }, [settings])
  const save = async () => {
    if (!supabase || !form.channel_name.trim() || !form.timezone.trim()) return
    const { error } = await supabase.from('channel_settings').upsert({ id: true, channel_name: form.channel_name.trim(), timezone: form.timezone.trim(), logo_url: form.logo_url.trim() || null })
    if (error) notify('No se pudieron guardar los ajustes.')
    else { notify('Ajustes guardados.'); onChanged() }
  }
  return <><div className="page-heading"><p>CANAL</p><h1>Ajustes</h1></div><form className="admin-card settings-form" onSubmit={e => { e.preventDefault(); void save() }}><label>Nombre del canal<input value={form.channel_name} onChange={e => setForm({ ...form, channel_name: e.target.value })} required /></label><label>Zona horaria<input value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} placeholder="America/Managua" required /></label><label>URL del logo<input type="url" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" /></label><button>Guardar ajustes</button></form></>
}
