import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './lib/supabase'
import type { Anime, ChannelSettings, ScheduleEntry } from './types/database'
import { AnimesTab } from './components/admin/AnimesTab'
import { ScheduleTab } from './components/admin/ScheduleTab'
import { SettingsTab } from './components/admin/SettingsTab'
import './admin.css'

type Tab = 'animes' | 'schedule' | 'settings'
const tabs: Array<[Tab, string]> = [['animes', 'Animes'], ['schedule', 'Programación'], ['settings', 'Ajustes']]

export default function Admin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false); const [checking, setChecking] = useState(true); const [tab, setTab] = useState<Tab>('animes')
  const [animes, setAnimes] = useState<Anime[]>([]); const [schedule, setSchedule] = useState<ScheduleEntry[]>([]); const [settings, setSettings] = useState<ChannelSettings | null>(null)
  const notify = (text: string) => setMessage(text)
  const load = async (query = '') => {
    if (!supabase) return
    const fields = 'id,title'; const text = query.trim()
    const direct = text ? supabase.from('animes').select(fields).ilike('title', `%${text}%`).order('title').limit(100) : supabase.from('animes').select(fields).order('title').limit(100)
    const [d, s, c] = await Promise.all([direct, supabase.from('schedule_entries').select('id,anime_id,content_type,day_of_week,schedule_date,starts_at,ends_at').order('starts_at'), supabase.from('channel_settings').select('channel_name,timezone,logo_url').eq('id', true).maybeSingle()])
    if (d.error || s.error || c.error) { notify('No se pudo cargar la información.'); return }
    setAnimes(d.data ?? []); setSchedule(s.data ?? []); setSettings(c.data)
  }
  const checkRole = async () => { if (!supabase) { notify('Falta configurar Supabase.'); setChecking(false); return }; const { data: { user } } = await supabase.auth.getUser(); if (!user) { setAuthorized(false); setChecking(false); return }; const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle(); setAuthorized(Boolean(data)); setChecking(false); if (data) { setMessage(null); void load() } else notify('Esta cuenta no está autorizada para administrar el canal.') }
  useEffect(() => { void checkRole(); const listener = supabase?.auth.onAuthStateChange(() => void checkRole()); return () => listener?.data.subscription.unsubscribe() }, [])
  const login = async (event: FormEvent) => { event.preventDefault(); if (!supabase) return; setMessage(null); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) notify('No se pudo iniciar sesión.') }
  if (checking) return <main className="admin-shell">Comprobando acceso…</main>
  if (!authorized) return <main className="login-shell"><form className="login-card" onSubmit={login}><a href="/" className="back">← Ver programación</a><h1>Administración</h1><p>Acceso para el equipo de ANIMAS.</p><label>Correo<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{message && <p className="notice">{message}</p>}<button>Entrar al panel</button></form></main>
  return <main className="admin-shell"><header className="admin-top"><a href="/" className="admin-brand">ANIMAS <span>ADMIN</span></a><button className="signout" onClick={() => void supabase?.auth.signOut()}>Cerrar sesión</button></header><div className="admin-layout"><aside aria-label="Secciones del panel">{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</aside><section className="admin-content">{message && <p className="notice" role="status">{message}</p>}{tab === 'animes' && <AnimesTab animes={animes} schedule={schedule} reload={query => void load(query)} notify={notify} />}{tab === 'schedule' && <ScheduleTab animes={animes} schedule={schedule} reload={() => void load()} notify={notify} />}{tab === 'settings' && <SettingsTab settings={settings} onChanged={() => void load()} notify={notify} />}</section></div></main>
}
