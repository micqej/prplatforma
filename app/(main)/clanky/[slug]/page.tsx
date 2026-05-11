import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ViewCounter from '@/components/ViewCounter'
import LiveReaders from '@/components/LiveReaders'

interface Props {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('*, categories(name, slug), profiles(full_name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.content?.replace(/<[^>]+>/g, '').slice(0, 160),
    alternates: { canonical: `https://prplatforma.sk/clanky/${slug}` },
    openGraph: {
      title: article.title,
      description: article.content?.replace(/<[^>]+>/g, '').slice(0, 160),
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const publishedDate = new Date(article.published_at).toLocaleDateString('sk', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const initials = (article.profiles as any)?.full_name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  return (
    <>
      <ViewCounter slug={slug} articleId={article.id} />
      <div className="max-w-[760px] mx-auto px-10 py-12">
        <Link href="/" className="text-[13px] text-[#7a7770] flex items-center gap-2 mb-8 hover:text-[#0e0e0e] transition-colors">
          ← Späť na články
        </Link>

        <div className="inline-block text-[11px] font-medium tracking-[0.8px] uppercase text-[#c8502a] border border-[#c8502a]/30 rounded-full px-3 py-[3px] mb-4">
          {(article.categories as any)?.name}
        </div>

        <h1 className="font-serif text-[40px] leading-[1.15] tracking-tight mb-5">{article.title}</h1>

        <div className="flex items-center gap-3 mb-7 pb-7 border-b border-[#e4e2dc]">
          <div className="w-[38px] h-[38px] rounded-full bg-[#f5e8e3] flex items-center justify-center text-[13px] font-medium text-[#c8502a] shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{(article.profiles as any)?.full_name}</div>
            <div className="text-xs text-[#7a7770]">{publishedDate} · {article.read_time_minutes} min čítania</div>
          </div>
          <LiveReaders articleId={article.id} />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2.5 mb-8">
          {[
            { label: 'Celkom zobrazení', val: article.view_count.toLocaleString('sk') },
            { label: 'Čas čítania', val: `${article.read_time_minutes} min` },
            { label: 'Kategória', val: (article.categories as any)?.name },
            { label: 'Publikované', val: new Date(article.published_at).toLocaleDateString('sk', { day: 'numeric', month: 'numeric', year: 'numeric' }) },
          ].map((s) => (
            <div key={s.label} className="bg-[#f2f1ee] rounded-[6px] px-4 py-3.5">
              <div className="text-[11px] text-[#7a7770] mb-1">{s.label}</div>
              <div className="text-xl font-medium text-[#0e0e0e]">{s.val}</div>
            </div>
          ))}
        </div>

        {article.cover_image_url && (
          <div className="w-full aspect-video bg-[#f2f1ee] rounded-xl mb-8 overflow-hidden">
            <Image src={article.cover_image_url} alt={article.title} width={760} height={428} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="article-body text-[17px] leading-[1.8] text-[#3a3834]"
          dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
        />
      </div>
    </>
  )
}
