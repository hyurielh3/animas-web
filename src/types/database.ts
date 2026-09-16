export type ContentType = 'anime' | 'premiere' | 'repeat' | 'retro' | 'full_anime' | 'movie' | 'special' | 'other'
export interface Anime { id: string; title: string; title_japanese: string | null; title_english: string | null; synopsis: string | null; cover_path: string | null }
export interface ScheduleEntry { id: string; anime_id: string; content_type: ContentType; day_of_week: number | null; schedule_date: string | null; starts_at: string; ends_at: string }
export interface ChannelSettings { channel_name: string; timezone: string; logo_url: string | null }
export interface Programme extends ScheduleEntry { anime: Anime }
