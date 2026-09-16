import { useMemo, useState } from 'react'
import { useSchedule } from './hooks/useSchedule'
import { days as weekDays, entriesForDate, findCurrentAndNext, formatTime, typeLabel, weekdayForDate } from './lib/schedule'
import type { Programme, ScheduleEntry } from './types/database'

function programmeTitle(anime: Programme['anime']) { const franchise = anime.franchise?.[0]?.name; return franchise ? `${franchise} ${anime.title}` : anime.title }

function ProgrammeCard({ item, active }: { item: Programme; active: boolean }) {
  const [isOpen, setOpen] = useState(false)
  const markers = { premiere: '★', repeat: '↻', retro: '◒', full_anime: '◆', movie: '●', special: '✦', other: '•' }
  const marker = item.content_type === 'anime' ? null : markers[item.content_type]
  return <article className={`programme ${active ? 'programme-active' : ''}`}><button type="button" onClick={() => setOpen(!isOpen)} aria-expanded={isOpen}><time>{formatTime(item.starts_at)}</time><span className="programme-name"><b>{programmeTitle(item.anime)}</b>{marker && <i className="programme-kind" tabIndex={0} aria-label={typeLabel(item.content_type)} data-tooltip={typeLabel(item.content_type)}>{marker}</i>}</span></button>{isOpen && item.anime.synopsis && <p className="synopsis">{item.anime.synopsis}</p>}</article>
}

function toProgrammes(entries: ScheduleEntry[], animes: Map<string, Programme['anime']>) {
  return entries.sort((a, b) => a.starts_at.localeCompare(b.starts_at)).flatMap((entry) => { const anime = animes.get(entry.anime_id); return anime ? [{ ...entry, anime }] : [] })
}

function App() {
  const { settings, loading, error, channelDate, channelTime, programmes, entries, animes } = useSchedule()
  const currentDay = weekdayForDate(channelDate)
  const today = 0
  const days = [...weekDays.slice(currentDay), ...weekDays.slice(0, currentDay)]
  const weekly = useMemo(() => {
    const animeIndex = new Map(animes.map((anime) => [anime.id, anime]))
    const byWeekday = weekDays.map((_, dayIndex) => toProgrammes(dayIndex === currentDay ? entriesForDate(entries, channelDate) : entries.filter((entry) => entry.schedule_date === null && entry.day_of_week === dayIndex), animeIndex))
    return [...byWeekday.slice(currentDay), ...byWeekday.slice(0, currentDay)]
  }, [animes, channelDate, currentDay, entries])
  const { now, next } = findCurrentAndNext(programmes, channelTime)
  const heading = now ? programmeTitle(now.anime) : 'Sin emisión programada'
  const detail = now ? now.anime.synopsis : 'La guía mostrará la programación cuando el canal agregue sus próximos bloques.'
  return <main className="site"><header className="topbar"><div className="topbar-inner"><div className="brand" role="img" aria-label={settings.channel_name} /><span className="station">CANAL ANIME</span></div></header><div className="content"><p className="eyebrow">SEÑAL EN VIVO · {settings.timezone}</p>{loading ? <div className="hero" aria-label="Cargando programación" /> : error ? <p className="hero hero-copy empty">{error}</p> : <section className={`hero ${now ? '' : 'empty'}`}><div className="hero-copy"><h1 className="hero-title">{heading}</h1>{now && <p className="hero-time">{formatTime(now.starts_at)} — {formatTime(now.ends_at)}</p>}<p className="hero-text">{detail}</p></div><aside className="hero-side"><small>{now ? 'EN EMISIÓN' : 'ESTADO DEL CANAL'}</small><strong>{now ? 'Transmisión activa' : 'Programación pendiente'}</strong></aside></section>}{next && <div className="next"><span className="next-label">A CONTINUACIÓN</span><b>{next.anime.title}</b><time>{formatTime(next.starts_at)}</time></div>}<section className="guide"><div className="guide-head"><div><p className="eyebrow">GUÍA DEL CANAL</p><h2 className="guide-title">Programación semanal</h2></div><p className="hint">Cada programa aparece debajo del día al que pertenece.</p></div><div className="week-wrap">{loading ? <p className="no-guide">Cargando guía…</p> : <div className="week-grid">{days.map((day, index) => <section className={`day-column ${index === today ? 'today' : ''}`} key={day}><h3>{day}</h3><div className="day-programmes">{weekly[index].length ? weekly[index].map((item) => <ProgrammeCard key={item.id} item={item} active={index === today && item.id === now?.id} />) : <p className="empty-day">Sin programación</p>}</div></section>)}</div>}</div></section></div><footer className="footer"><div className="footer-inner"><span>ANIMAS · programación 24/7</span><span>Hora del canal: {formatTime(channelTime)}</span></div></footer></main>
}
export default App
