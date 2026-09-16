import type { Programme, ScheduleEntry } from '../types/database'
export const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export function dateInTimezone(timezone: string, now = new Date()) { const p = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now); const v = Object.fromEntries(p.map(({ type, value }) => [type, value])); return `${v.year}-${v.month}-${v.day}` }
export function timeInTimezone(timezone: string, now = new Date()) { return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(now) }
export function weekdayForDate(date: string) { return new Date(`${date}T12:00:00`).getDay() }
/** A dated guide replaces the recurring guide for its complete calendar day. */
export function entriesForDate(entries: ScheduleEntry[], date: string) { const dated = entries.filter((entry) => entry.schedule_date === date); return (dated.length ? dated : entries.filter((entry) => entry.schedule_date === null && entry.day_of_week === weekdayForDate(date))).sort((a, b) => a.starts_at.localeCompare(b.starts_at)) }
export function findCurrentAndNext(items: Programme[], time: string) { return { now: items.find((item) => item.starts_at <= time && time < item.ends_at) ?? null, next: items.find((item) => item.starts_at > time) ?? null } }
export function formatTime(time: string) {
  const [hourText, minute] = time.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minute} ${suffix}`
}
export function typeLabel(type: Programme['content_type']) { return ({ anime: 'Anime', premiere: 'Estreno', repeat: 'Repetición', retro: 'Retro', full_anime: 'Anime completo', movie: 'Película', special: 'Especial', other: 'Otro' })[type] }
