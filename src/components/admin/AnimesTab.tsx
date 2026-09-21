import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Anime } from '../../types/database'

export function AnimesTab({ animes, reload, notify }: { animes: Anime[]; reload: (query?: string) => void; notify: (message: string) => void }) {
  const [query, setQuery] = useState(''); const [editing, setEditing] = useState<string | null>(null); const [title, setTitle] = useState('')
  const reset = () => { setEditing(null); setTitle('') }
  const save = async (event: FormEvent) => { event.preventDefault(); if (!supabase || !title.trim()) return; const values = { title: title.trim() }; const { error } = editing ? await supabase.from('animes').update(values).eq('id', editing) : await supabase.from('animes').insert(values); if (error) notify('No se pudo guardar el anime.'); else { notify(editing ? 'Anime actualizado.' : 'Anime creado.'); reset(); reload(query) } }
  const remove = async (id: string) => { if (!supabase || !window.confirm('¿Eliminar este anime?')) return; const { error } = await supabase.from('animes').delete().eq('id', id); if (error) notify('No se pudo eliminar. Un anime con horarios asociados no se elimina.'); else reload(query) }
  return <><div className="page-heading"><p>CATÁLOGO</p><h1>{editing ? 'Editar anime' : 'Animes'}</h1></div><form className="catalogue-search" onSubmit={e => { e.preventDefault(); reload(query) }}><input placeholder="Buscar por título…" value={query} onChange={e => setQuery(e.target.value)} /><button>Buscar</button></form><form className="anime-form simple-anime-form" onSubmit={save}><label>Título del anime *<input value={title} onChange={e => setTitle(e.target.value)} required /></label><div className="form-actions"><button>{editing ? 'Guardar cambios' : 'Agregar anime'}</button>{editing && <button type="button" className="secondary" onClick={reset}>Cancelar</button>}</div></form><div className="admin-list">{animes.map(anime => <article key={anime.id}><b>{anime.title}</b><span className="row-actions"><button onClick={() => { setEditing(anime.id); setTitle(anime.title); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Editar</button><button className="danger" onClick={() => void remove(anime.id)}>Eliminar</button></span></article>)}</div></>
}
