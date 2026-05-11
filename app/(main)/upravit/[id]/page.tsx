import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArticleForm from '@/components/ArticleForm'

export const metadata = { title: 'Upraviť článok' }

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/prihlasenie')

  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!article) notFound()

  return <ArticleForm categories={categories ?? []} article={article} />
}
