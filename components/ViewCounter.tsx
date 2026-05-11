'use client'

import { useEffect } from 'react'

export default function ViewCounter({ slug, articleId }: { slug: string; articleId: string }) {
  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: 'POST' })
  }, [slug])
  return null
}
