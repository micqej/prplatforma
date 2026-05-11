import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Môj profil' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/prihlasenie')

  const [{ data: profile }, { data: articles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('articles')
      .select('id, title, slug, view_count, published_at, status, category_id, categories(name), article_views(id, viewed_at)')
      .eq('user_id', user.id)
      .order('published_at', { ascending: false }),
  ])

  const totalViews = articles?.reduce((sum, a) => sum + (a.view_count ?? 0), 0) ?? 0
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisMonth = articles?.reduce((sum, a) => {
    const recent = (a.article_views as any[])?.filter((v) => new Date(v.viewed_at) >= monthStart).length ?? 0
    return sum + recent
  }, 0) ?? 0

  const initials = profile?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('sk', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="max-w-[900px] mx-auto px-10 py-12">
      {/* Header */}
      <div className="flex items-center gap-5 mb-9 pb-9 border-b border-[#e4e2dc]">
        <div className="w-16 h-16 rounded-full bg-[#f5e8e3] flex items-center justify-center font-serif text-[22px] text-[#c8502a] shrink-0">
          {initials}
        </div>
        <div>
          <div className="font-serif text-[28px] mb-0.5">{profile?.full_name ?? 'Autor'}</div>
          <div className="text-[13px] text-[#7a7770]">Autor od {since} · {user.email}</div>
        </div>
        <div className="ml-auto">
          <Link href="/pridat" className="inline-flex items-center gap-2 px-[22px] py-3 bg-transparent text-[#0e0e0e] border border-[#e4e2dc] rounded-[6px] text-sm font-medium hover:bg-[#f2f1ee] transition-colors">
            + Nový článok
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Moje články', val: String(articles?.length ?? 0) },
          { label: 'Celkom zobrazení', val: totalViews.toLocaleString('sk') },
          { label: 'Tento mesiac', val: thisMonth.toLocaleString('sk') },
          { label: 'Zostatok článkov', val: '∞ free', accent: true },
        ].map((s) => (
          <div key={s.label} className="bg-[#f2f1ee] rounded-[6px] px-4 py-4">
            <div className="text-xs text-[#7a7770] mb-1.5">{s.label}</div>
            <div className={`font-serif text-[28px] ${s.accent ? 'text-[#c8502a]' : 'text-[#0e0e0e]'}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-[26px] tracking-tight mb-4">Moje publikácie</h2>

      <div className="border border-[#e4e2dc] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Názov', 'Kategória', 'Zobrazenia', 'Tento týždeň', 'Publikované', 'Stav'].map((h) => (
                <th key={h} className="text-left text-[12px] font-medium tracking-[0.5px] uppercase text-[#7a7770] px-5 py-3 bg-[#f2f1ee] border-b border-[#e4e2dc]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#7a7770] text-sm">
                  Zatiaľ nemáš žiadne články.{' '}
                  <Link href="/pridat" className="text-[#c8502a] underline">Pridaj prvý</Link>
                </td>
              </tr>
            )}
            {(articles ?? []).map((a) => {
              const weekViews = (a.article_views as any[])?.filter((v) => new Date(v.viewed_at) >= weekAgo).length ?? 0
              return (
                <tr key={a.id} className="hover:bg-[#f2f1ee] transition-colors">
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc]">
                    <Link href={`/clanky/${a.slug}`} className="text-sm font-medium hover:text-[#c8502a] transition-colors line-clamp-1">
                      {a.title}
                    </Link>
                    <Link href={`/upravit/${a.id}`} className="text-xs text-[#7a7770] hover:text-[#0e0e0e] ml-2">(upraviť)</Link>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc] text-[11px] font-medium uppercase tracking-[0.5px] text-[#c8502a]">
                    {(a.categories as any)?.name}
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc] text-sm text-[#3a3834]">
                    {(a.view_count ?? 0).toLocaleString('sk')}
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc] text-sm text-[#3a3834]">
                    {weekViews.toLocaleString('sk')}
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc] text-[13px] text-[#7a7770]">
                    {new Date(a.published_at).toLocaleDateString('sk', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e4e2dc]">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1a7a3e] bg-[#e6f5ec] px-2.5 py-[3px] rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1a7a3e] live-dot" /> Živý
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
