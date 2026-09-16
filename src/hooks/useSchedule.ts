import { useEffect, useMemo, useState } from 'react'
import { dateInTimezone, entriesForDate, timeInTimezone } from '../lib/schedule'
import { supabase } from '../lib/supabase'
import type { Anime, ChannelSettings, Programme, ScheduleEntry } from '../types/database'
const defaults: ChannelSettings = { channel_name: 'ANIMAS', timezone: 'America/Managua', logo_url: null }
export function useSchedule() {
  const [settings, setSettings] = useState(defaults); const [animes, setAnimes] = useState<Anime[]>([]); const [entries, setEntries] = useState<ScheduleEntry[]>([]); const [loading, setLoading] = useState(Boolean(supabase)); const [error, setError] = useState<string | null>(null); const [clock, setClock] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setClock(new Date()), 30_000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { if (!supabase) return; const client: NonNullable<typeof supabase> = supabase; async function load() { const [setting, anime, guide] = await Promise.all([client.from('channel_settings').select('channel_name, timezone, logo_url').single(), client.from('animes').select('id, franchise_id, title, season_number, season_label, title_japanese, title_english, synopsis, cover_path'), client.from('schedule_entries').select('id, anime_id, content_type, day_of_week, schedule_date, starts_at, ends_at')]); if (setting.error || anime.error || guide.error) setError('No se pudo cargar la programación. Intenta nuevamente en unos minutos.'); else { setSettings(setting.data); setAnimes(anime.data); setEntries(guide.data) }; setLoading(false) }; void load() }, [])
  const channelDate = dateInTimezone(settings.timezone, clock); const channelTime = timeInTimezone(settings.timezone, clock)
  const programmes = useMemo<Programme[]>(() => { const index = new Map(animes.map((anime) => [anime.id, anime])); return entriesForDate(entries, channelDate).flatMap((entry) => { const anime = index.get(entry.anime_id); return anime ? [{ ...entry, anime }] : [] }) }, [animes, entries, channelDate])
  return { settings, loading, error, channelDate, channelTime, programmes, entries, animes }
}
