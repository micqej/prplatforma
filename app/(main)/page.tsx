import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import CategoryFilter from '@/components/CategoryFilter'

export const revalidate = 60

async function getStats() {
  const supabase = await createClient()
  const [{ count: articleCount }, { count: authorCount }] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])
  // views this month
  const from = new Date()
  from.setDate(1)
  from.setHours(0, 0, 0, 0)
  const { count: viewCount } = await supabase
    .from('article_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', from.toISOString())
  return { articleCount: articleCount ?? 0, authorCount: authorCount ?? 0, viewCount: viewCount ?? 0 }
}

async function getArticles(categorySlug?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('articles')
    .select('id, title, slug, cover_image_url, view_count, read_time_minutes, published_at, categories(name, slug), profiles(full_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  if (categorySlug && categorySlug !== 'vsetky') {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data } = await query
  return data ?? []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  return data ?? []
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)} ${(n / 1000) >= 10 ? '' : ''}` + (n >= 1000 ? 'tis.' : '') : n.toString()
}

function fmtNum(n: number) {
  return n.toLocaleString('sk')
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>
}) {
  const params = await searchParams
  const [stats, articles, categories] = await Promise.all([
    getStats(),
    getArticles(params.kategoria),
    getCategories(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0e0e0e] text-[#fafaf8] px-10 py-20 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#c8502a] opacity-[0.12]" />
        <div className="max-w-[760px] relative">
          <div className="inline-block text-xs font-medium tracking-widest uppercase text-[#c8502a] border border-[#c8502a]/40 rounded-full px-3.5 py-1 mb-5">
            Bezplatná PR platforma pre Slovensko
          </div>
          <h1 className="font-serif text-[52px] leading-[1.1] tracking-tight mb-4 text-[#fafaf8]">
            Zviditeľni svoju firmu<br />cez <em className="text-[#c8502a] not-italic">vlastný obsah</em>
          </h1>
          <p className="text-[17px] text-[#fafaf8]/65 max-w-[480px] mb-9 font-light leading-[1.7]">
            Publikuj PR články, buduj autoritu a získavaj zákazníkov. Každý článok sa indexuje vo vyhľadávačoch a má transparentné štatistiky.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/auth/registracia" className="inline-flex items-center gap-2 px-[22px] py-3 rounded-[6px] text-sm font-medium bg-[#fafaf8] text-[#0e0e0e] hover:bg-[#f2f1ee] transition-colors">
              Začni zadarmo →
            </Link>
            <Link href="/pridat" className="inline-flex items-center gap-2 px-[22px] py-3 rounded-[6px] text-sm font-medium bg-white/10 text-[#fafaf8] border border-white/20 hover:bg-white/[0.16] transition-colors">
              Pridať prvý článok
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-[#e4e2dc]">
        {[
          { num: fmtNum(stats.articleCount), label: 'Publikovaných článkov' },
          { num: fmtNum(stats.authorCount), label: 'Aktívnych autorov' },
          { num: fmtNum(stats.viewCount), label: 'Čítaní tento mesiac' },
        ].map((s, i) => (
          <div key={i} className={`px-10 py-7 ${i < 2 ? 'border-r border-[#e4e2dc]' : ''}`}>
            <div className="font-serif text-[36px] text-[#0e0e0e] mb-0.5">{s.num}</div>
            <div className="text-[13px] text-[#7a7770] font-light">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <CategoryFilter categories={categories} active={params.kategoria ?? 'vsetky'} />

      {/* Articles */}
      <div className="max-w-[1100px] mx-auto px-10 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-[26px] tracking-tight">Najnovšie články</h2>
          <span className="text-[13px] text-[#7a7770]">{fmtNum(stats.articleCount)} článkov</span>
        </div>

        {articles.length === 0 ? (
          <p className="text-[#7a7770] text-center py-20">Žiadne články v tejto kategórii.</p>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-[#e4e2dc] border border-[#e4e2dc] rounded-xl overflow-hidden">
            {articles.map((a: any) => (
              <Link
                key={a.id}
                href={`/clanky/${a.slug}`}
                className="bg-[#fafaf8] p-6 flex flex-col hover:bg-[#f2f1ee] transition-colors"
              >
                <div className="w-full aspect-video bg-[#f2f1ee] rounded-[6px] mb-4 overflow-hidden flex items-center justify-center text-[#b0ada4] text-4xl">
                  {a.cover_image_url ? (
                    <Image src={a.cover_image_url} alt={a.title} width={400} height={225} className="w-full h-full object-cover" />
                  ) : '📄'}
                </div>
                <span className="text-[11px] font-medium tracking-[0.5px] uppercase text-[#c8502a] mb-2">
                  {(a.categories as any)?.name}
                </span>
                <h3 className="font-serif text-[18px] leading-[1.3] text-[#0e0e0e] mb-2 flex-1">{a.title}</h3>
                <div className="flex items-center gap-3.5 text-xs text-[#7a7770] mt-4 pt-3.5 border-t border-[#e4e2dc]">
                  <span>👁 {fmtNum(a.view_count)}</span>
                  <span>⏱ {a.read_time_minutes} min</span>
                  <span>{(a.profiles as any)?.full_name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
