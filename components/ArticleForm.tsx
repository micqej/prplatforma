'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import RichEditor from '@/components/editor/RichEditor'
import { toSlug, uniqueSlug } from '@/lib/slug'

interface Category { id: string; name: string }
interface Article {
  id?: string
  title?: string
  content?: string
  category_id?: string
  cover_image_url?: string
  read_time_minutes?: number
}

export default function ArticleForm({ categories, article }: { categories: Category[]; article?: Article }) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!article?.id

  const [title, setTitle] = useState(article?.title ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [categoryId, setCategoryId] = useState(article?.category_id ?? '')
  const [readTime, setReadTime] = useState(article?.read_time_minutes ?? 3)
  const [coverUrl, setCoverUrl] = useState(article?.cover_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const coverRef = useRef<HTMLInputElement>(null)

  async function uploadCover(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const { publicUrl, error } = await res.json()
      if (error) throw new Error(error)
      setCoverUrl(publicUrl)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Zadaj názov článku'); return }
    if (!categoryId) { setError('Vyber kategóriu'); return }
    if (!content || content === '<p></p>') { setError('Napíš obsah článku'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/prihlasenie'); return }

      if (isEdit) {
        const { error: err } = await supabase
          .from('articles')
          .update({ title, content, category_id: categoryId, cover_image_url: coverUrl, read_time_minutes: readTime })
          .eq('id', article.id)
          .eq('user_id', user.id)
        if (err) throw err
        router.push(`/clanky/${article.id}`)
      } else {
        const slug = await uniqueSlug(title, async (s) => {
          const { data } = await supabase.from('articles').select('id').eq('slug', s).maybeSingle()
          return !!data
        })
        const { data, error: err } = await supabase
          .from('articles')
          .insert({ title, slug, content, category_id: categoryId, cover_image_url: coverUrl, read_time_minutes: readTime, user_id: user.id })
          .select('slug')
          .single()
        if (err) throw err
        router.push(`/clanky/${data.slug}`)
      }
    } catch (e: any) {
      setError(e.message ?? 'Chyba pri ukladaní')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-[680px] mx-auto px-10 py-12">
      <h1 className="font-serif text-[32px] mb-1.5">{isEdit ? 'Upraviť článok' : 'Nový článok'}</h1>
      <p className="text-[15px] text-[#7a7770] mb-9 font-light">
        {isEdit ? 'Uprav a ulož zmeny.' : 'Vyplň formulár a tvoj článok bude okamžite publikovaný.'}
      </p>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-[6px] px-4 py-2">{error}</div>}

      {/* Title */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Názov článku</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Napíš výstižný, konkrétny nadpis..."
          className="w-full bg-[#fafaf8] border border-[#e4e2dc] rounded-[6px] px-3.5 py-2.5 text-[15px] font-sans text-[#0e0e0e] outline-none focus:border-[#0e0e0e] transition-colors"
        />
        <div className="text-[12px] text-[#b0ada4] text-right mt-1">{title.length} / 80</div>
      </div>

      {/* Category + Read time */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Kategória</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[#fafaf8] border border-[#e4e2dc] rounded-[6px] px-3.5 py-2.5 text-[15px] font-sans text-[#0e0e0e] outline-none focus:border-[#0e0e0e] appearance-none"
          >
            <option value="">Vyber kategóriu...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Čas čítania</label>
          <select
            value={readTime}
            onChange={(e) => setReadTime(Number(e.target.value))}
            className="w-full bg-[#fafaf8] border border-[#e4e2dc] rounded-[6px] px-3.5 py-2.5 text-[15px] font-sans text-[#0e0e0e] outline-none focus:border-[#0e0e0e] appearance-none"
          >
            <option value={3}>3 minúty</option>
            <option value={5}>5 minút</option>
            <option value={7}>7 minút</option>
            <option value={10}>10+ minút</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Text článku</label>
        <RichEditor content={content} onChange={setContent} />
      </div>

      {/* Cover image */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Titulná fotka</label>
        {coverUrl ? (
          <div className="relative w-full aspect-video rounded-[6px] overflow-hidden mb-2">
            <Image src={coverUrl} alt="Cover" fill className="object-cover" />
            <button type="button" onClick={() => setCoverUrl('')} className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Odstrániť
            </button>
          </div>
        ) : (
          <div
            onClick={() => coverRef.current?.click()}
            className="border-[1.5px] border-dashed border-[#e4e2dc] rounded-[6px] p-10 text-center cursor-pointer hover:border-[#b0ada4] hover:bg-[#f2f1ee] transition-all"
          >
            <div className="text-[28px] text-[#b0ada4] mb-2.5">📎</div>
            <div className="text-sm text-[#7a7770]">{uploading ? 'Nahrávam...' : 'Klikni alebo pretiahni súbor sem'}</div>
            <div className="text-xs text-[#b0ada4] mt-1">JPG, PNG, WebP · max 5 MB · 1200×630 px</div>
          </div>
        )}
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-6 border-t border-[#e4e2dc] mt-2">
        <span className="text-[13px] text-[#7a7770]">Článok bude publikovaný okamžite po odoslaní.</span>
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-[22px] py-3 bg-[#0e0e0e] text-[#fafaf8] rounded-[6px] text-sm font-medium hover:bg-[#3a3834] transition-colors disabled:opacity-50"
        >
          {saving ? 'Ukladám...' : isEdit ? 'Uložiť zmeny →' : 'Publikovať článok →'}
        </button>
      </div>
    </form>
  )
}
