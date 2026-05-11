import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const sessionId = req.cookies.get('session_id')?.value ?? crypto.randomUUID()

  await Promise.all([
    supabase.from('article_views').insert({ article_id: article.id, session_id: sessionId }),
    supabase.rpc('increment_view_count', { article_id: article.id }),
  ])

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session_id', sessionId, { maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: 'lax' })
  return res
}
