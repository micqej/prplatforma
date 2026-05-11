import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const articleUrls: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `https://prplatforma.sk/clanky/${a.slug}`,
    lastModified: new Date(a.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: 'https://prplatforma.sk', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...articleUrls,
  ]
}
