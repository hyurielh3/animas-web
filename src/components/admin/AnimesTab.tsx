import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Anime, ScheduleEntry } from '../../types/database'

export function AnimesTab({ animes, schedule, reload, notify }: { animes: Anime[]; schedule: ScheduleEntry[]; reload: (query?: string) => void; notify: (message: string) => void }) {
  const [query, setQuery] = useState(''); const [editing, setEditing] = useState<string | null>(null); const [title, setTitle] = useState('')
  const reset = () => { setEditing(null); setTitle('') }
  const save = async (event: FormEvent) => { event.preventDefault(); if (!supabase || !title.trim()) return; const values = { title: title.trim() }; const { error } = editing ? await supabase.from('animes').update(values).eq('id', editing) : await supabase.from('animes').insert(values); if (error) notify('No se pudo guardar el anime.'); else { notify(editing ? 'Anime actualizado.' : 'Anime creado.'); reset(); reload(query) } }
  const remove = async (anime: Anime) => {
    if (!supabase) return
    const blocks = schedule.filter(entry => entry.anime_id === anime.id).length
    const detail = blocks ? ` y sus ${blocks} bloque${blocks === 1 ? '' : 's'} de programación` : ''
    if (!window.confirm(`¿Eliminar “${anime.title}”${detail}? Esta acción no se puede deshacer.`)) return
    if (blocks) { const { error } = await supabase.from('schedule_entries').delete().eq('anime_id', anime.id); if (error) { notify('No se pudieron eliminar los bloques asociados.'); return } }
    const { error } = await supabase.from('animes').delete().eq('id', anime.id)
    if (error) notify('Los bloques se eliminaron, pero no se pudo eliminar el anime.')
    else { notify(`Anime eliminado${blocks ? ` junto con ${blocks} bloque${blocks === 1 ? '' : 's'}` : ''}.`); reload(query) }
  }
  return <><div className="page-heading"><p>CATÁLOGO</p><h1>{editing ? 'Editar anime' : 'Animes'}</h1></div><form className="catalogue-search" onSubmit={e => { e.preventDefault(); reload(query) }}><input placeholder="Buscar por título…" value={query} onChange={e => setQuery(e.target.value)} /><button>Buscar</button></form><form className="anime-form simple-anime-form" onSubmit={save}><label>Título del anime *<input value={title} onChange={e => setTitle(e.target.value)} required /></label><div className="form-actions"><button>{editing ? 'Guardar cambios' : 'Agregar anime'}</button>{editing && <button type="button" className="secondary" onClick={reset}>Cancelar</button>}</div></form><div className="admin-list">{animes.map(anime => { const blocks = schedule.filter(entry => entry.anime_id === anime.id).length; return <article key={anime.id}><span><b>{anime.title}</b>{blocks > 0 && <small>{blocks} bloque{blocks === 1 ? '' : 's'} programado{blocks === 1 ? '' : 's'}</small>}</span><span className="row-actions"><button onClick={() => { setEditing(anime.id); setTitle(anime.title); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Editar</button><button className="danger" onClick={() => void remove(anime)}>Eliminar</button></span></article> })}</div></>
}
