import { useMemo, useState } from 'react'
import { useSchedule } from './hooks/useSchedule'
import { days, findCurrentAndNext, formatTime, typeLabel, weekdayForDate } from './lib/schedule'
import type { Programme } from './types/database'

function ProgrammeRow({ item, active }: { item: Programme; active: boolean }) {
  const [isOpen, setOpen] = useState(false)
  return <article className={`programme ${active ? 'programme-active' : ''}`}><button type="button" onClick={() => setOpen(!isOpen)} aria-expanded={isOpen}><span><b>{item.anime.title}</b><small>{typeLabel(item.content_type)}</small></span><time>{formatTime(item.starts_at)} — {formatTime(item.ends_at)}</time></button>{isOpen && item.anime.synopsis && <p className="synopsis">{item.anime.synopsis}</p>}</article>
}

function App() {
  const { settings, loading, error, channelDate, channelTime, programmes, entries, animes } = useSchedule()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const today = weekdayForDate(channelDate)
  const visible = useMemo(() => { if (selectedDay === null || selectedDay === today) return programmes; const map = new Map(animes.map((anime) => [anime.id, anime])); return entries.filter((entry) => entry.schedule_date === null && entry.day_of_week === selectedDay).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).flatMap((entry) => { const anime = map.get(entry.anime_id); return anime ? [{ ...entry, anime }] : [] }) }, [animes, entries, programmes, selectedDay, today])
  const { now, next } = findCurrentAndNext(programmes, channelTime)
  const heading = now ? now.anime.title : 'Sin emisión programada'
  const detail = now ? now.anime.synopsis : 'La guía mostrará la programación cuando el canal agregue sus próximos bloques.'
  return <main className="site"><header className="topbar"><div className="topbar-inner"><div className="brand" role="img" aria-label={settings.channel_name} /><span className="station">CANAL ANIME</span></div></header><div className="content"><p className="eyebrow">SEÑAL EN VIVO · {settings.timezone}</p>{loading ? <div className="hero" aria-label="Cargando programación" /> : error ? <p className="hero hero-copy empty">{error}</p> : <section className={`hero ${now ? '' : 'empty'}`}><div className="hero-copy"><h1 className="hero-title">{heading}</h1>{now && <p className="hero-time">{formatTime(now.starts_at)} — {formatTime(now.ends_at)}</p>}<p className="hero-text">{detail}</p></div><aside className="hero-side"><small>{now ? 'EN EMISIÓN' : 'ESTADO DEL CANAL'}</small><strong>{now ? 'Transmisión activa' : 'Programación pendiente'}</strong></aside></section>}{next && <div className="next"><span className="next-label">A CONTINUACIÓN</span><b>{next.anime.title}</b><time>{formatTime(next.starts_at)}</time></div>}<section className="guide"><div className="guide-head"><div><p className="eyebrow">GUÍA DEL CANAL</p><h2 className="guide-title">Programación</h2></div><p className="hint">Selecciona un día para consultar los horarios.</p></div><nav className="days" aria-label="Días de programación">{days.map((day, index) => <button key={day} type="button" className="day" aria-pressed={index === (selectedDay ?? today)} onClick={() => setSelectedDay(index)}>{day}</button>)}</nav><div className="schedule">{loading ? <p className="no-guide">Cargando guía…</p> : visible.length ? visible.map((item) => <ProgrammeRow key={item.id} item={item} active={selectedDay === null && item.id === now?.id} />) : <p className="no-guide">No hay programación configurada para este día.</p>}</div></section></div><footer className="footer"><div className="footer-inner"><span>ANIMAS · programación 24/7</span><span>Hora del canal: {formatTime(channelTime)}</span></div></footer></main>
}
export default App
