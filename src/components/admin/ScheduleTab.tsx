import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Anime, ContentType, ScheduleEntry } from '../../types/database'
import './schedule.css'

const types: Array<[ContentType, string]> = [['anime', 'Anime'], ['premiere', 'Estreno'], ['repeat', 'Repetición'], ['retro', 'Retro'], ['full_anime', 'Anime completo'], ['movie', 'Película'], ['special', 'Especial'], ['other', 'Otro']]
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
type Props = { animes: Anime[]; schedule: ScheduleEntry[]; reload: () => void; notify: (message: string) => void }

export function ScheduleTab({ animes, schedule, reload, notify }: Props) {
  const [animeId, setAnimeId] = useState('')
  const [mode, setMode] = useState<'weekly' | 'special'>('weekly')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [type, setType] = useState<ContentType>('anime')
  const toggleDay = (day: number) => setSelectedDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day].sort())
  const selectWeekdays = () => setSelectedDays([1, 2, 3, 4, 5])
  const selectAllDays = () => setSelectedDays(days.map((_, index) => index))
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || !animeId || !start || !end || start >= end || (mode === 'weekly' && !selectedDays.length) || (mode === 'special' && !date)) { notify('Completa los campos obligatorios y revisa el horario.'); return }
    const entries: Array<{ anime_id: string; content_type: ContentType; starts_at: string; ends_at: string; day_of_week: number | null; schedule_date: string | null }> = mode === 'weekly' ? selectedDays.map(day_of_week => ({ anime_id: animeId, content_type: type, starts_at: start, ends_at: end, day_of_week, schedule_date: null })) : [{ anime_id: animeId, content_type: type, starts_at: start, ends_at: end, day_of_week: null, schedule_date: date }]
    const { error } = await supabase.from('schedule_entries').insert(entries)
    if (error) notify('No se pudo guardar el bloque.')
    else { notify(mode === 'weekly' ? 'Bloque agregado a los días seleccionados.' : 'Bloque especial agregado.'); setStart(''); setEnd(''); reload() }
  }
  const remove = async (id: string) => { if (!supabase || !window.confirm('¿Eliminar este bloque?')) return; const { error } = await supabase.from('schedule_entries').delete().eq('id', id); if (error) notify('No se pudo eliminar el bloque.'); else reload() }
  return <><div className="page-heading"><p>GUÍA DEL CANAL</p><h1>Programación</h1></div><form className="schedule-form" onSubmit={save}><label>Anime *<select value={animeId} onChange={e => setAnimeId(e.target.value)} required><option value="">Selecciona un anime</option>{animes.map(anime => <option key={anime.id} value={anime.id}>{anime.title}</option>)}</select></label><label>Programación<select value={mode} onChange={e => setMode(e.target.value as 'weekly' | 'special')}><option value="weekly">Recurrente</option><option value="special">Día especial</option></select></label>{mode === 'weekly' ? <fieldset className="weekday-picker"><legend>Días de emisión</legend><div className="weekday-shortcuts"><button type="button" onClick={selectWeekdays}>L–V</button><button type="button" onClick={selectAllDays}>Todos</button><button type="button" onClick={() => setSelectedDays([])}>Limpiar</button></div><div className="weekday-options">{days.map((label, value) => <button type="button" className={selectedDays.includes(value) ? 'selected' : ''} key={label} aria-pressed={selectedDays.includes(value)} onClick={() => toggleDay(value)}>{label.slice(0, 3)}</button>)}</div></fieldset> : <label>Fecha especial *<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>}<label>Inicio *<input type="time" value={start} onChange={e => setStart(e.target.value)} required /></label><label>Final *<input type="time" value={end} onChange={e => setEnd(e.target.value)} required /></label><label>Tipo<select value={type} onChange={e => setType(e.target.value as ContentType)}>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button>Guardar bloque</button></form><p className="schedule-note">Selecciona los días con un toque. Usa los accesos rápidos para una semana laboral, todos los días o para empezar de cero.</p><div className="admin-list">{schedule.map(entry => <article key={entry.id}><span><b>{animes.find(anime => anime.id === entry.anime_id)?.title ?? 'Anime eliminado'}</b><small>{entry.schedule_date ? `Especial · ${entry.schedule_date}` : `Recurrente · ${days[entry.day_of_week ?? 0]}`} · {entry.starts_at.slice(0, 5)}—{entry.ends_at.slice(0, 5)} · {types.find(([value]) => value === entry.content_type)?.[1] ?? 'Anime'}</small></span><button className="danger" onClick={() => void remove(entry.id)}>Eliminar</button></article>)}</div></>
}
