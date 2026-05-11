import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArticleForm from '@/components/ArticleForm'

export const metadata = { title: 'Nový článok' }

export default async function PridatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/prihlasenie')

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return <ArticleForm categories={categories ?? []} />
}
