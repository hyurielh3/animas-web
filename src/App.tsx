import { useMemo } from 'react'
import { useSchedule } from './hooks/useSchedule'
import { days as weekDays, entriesForDate, findCurrentAndNext, formatTime, typeLabel, weekdayForDate } from './lib/schedule'
import type { Programme, ScheduleEntry } from './types/database'

function programmeTitle(anime: Programme['anime']) { return anime.title }

function ProgrammeCard({ item, active }: { item: Programme; active: boolean }) {
  const markers = { premiere: '★', repeat: '↻', retro: '◒', full_anime: '◆', movie: '●', special: '✦', other: '•' }
  const marker = item.content_type === 'anime' ? null : markers[item.content_type]
  return <article className={`programme ${active ? 'programme-active' : ''}`}><div><time>{formatTime(item.starts_at)}</time><span className="programme-name"><b>{programmeTitle(item.anime)}</b>{marker && <i className="programme-kind" tabIndex={0} aria-label={typeLabel(item.content_type)} data-tooltip={typeLabel(item.content_type)}>{marker}</i>}</span></div></article>
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
  const detail = now ? 'Disfruta la señal de ANIMAS.' : 'La guía mostrará la programación cuando el canal agregue sus próximos bloques.'
  return <main className="site"><header className="topbar"><div className="topbar-inner"><a className="brand" href="/" aria-label={`${settings.channel_name}: inicio`} /><nav aria-label="Navegación principal"><a className="nav-link active" href="#guia">Guía</a></nav></div></header><div className="content"><section className="intro"><div><p className="eyebrow">CANAL DE ANIME · {settings.timezone}</p><h1>Tu dosis diaria de anime, siempre a tiempo.</h1><p>Consulta qué está al aire, descubre lo que sigue y organiza tu semana de un vistazo.</p></div><div className="channel-clock"><span>HORA DEL CANAL</span><strong>{formatTime(channelTime)}</strong></div></section>{loading ? <div className="hero loading-card" aria-label="Cargando programación" /> : error ? <p className="hero hero-copy empty">{error}</p> : <section className={`hero ${now ? '' : 'empty'}`}><div className="hero-art"><span className="orb orb-one"/><span className="orb orb-two"/><span className="live-pill">{now ? <><i/> EN VIVO</> : 'PRÓXIMAMENTE'}</span><span className="hero-mark">ANIMAS</span></div><div className="hero-copy"><p className="section-kicker">{now ? 'EN PANTALLA AHORA' : 'ESTADO DEL CANAL'}</p><h2 className="hero-title">{heading}</h2>{now && <p className="hero-time">{formatTime(now.starts_at)} <span>—</span> {formatTime(now.ends_at)}</p>}<p className="hero-text">{detail}</p></div><aside className="hero-side"><small>{now ? 'TRANSMISIÓN ACTIVA' : 'PROGRAMACIÓN'}</small><strong>{now ? 'Disfruta el episodio.' : 'Volveremos pronto.'}</strong></aside></section>}{next && <div className="next"><span className="next-icon" aria-hidden="true">→</span><div><span className="next-label">A CONTINUACIÓN</span><b>{next.anime.title}</b></div><time>{formatTime(next.starts_at)}</time></div>}<section className="guide" id="guia"><div className="guide-head"><div><p className="eyebrow">PLANIFICA TU SEMANA</p><h2 className="guide-title">Guía de programación</h2></div><p className="hint">La emisión actual está marcada para que no pierdas el hilo.</p></div><div className="week-wrap">{loading ? <p className="no-guide">Cargando guía…</p> : <div className="week-grid">{days.map((day, index) => <section className={`day-column ${index === today ? 'today' : ''}`} key={day}><h3><span>{index === today ? 'HOY' : ''}</span>{day}</h3><div className="day-programmes">{weekly[index].length ? weekly[index].map((item) => <ProgrammeCard key={item.id} item={item} active={index === today && item.id === now?.id} />) : <p className="empty-day">Sin programación</p>}</div></section>)}</div>}</div></section></div><footer className="footer"><div className="footer-inner"><span>ANIMAS <i/> programación 24/7</span><span>Hora del canal: {formatTime(channelTime)}</span></div></footer></main>
}
export default App
