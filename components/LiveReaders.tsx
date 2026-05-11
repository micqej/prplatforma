'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LiveReaders({ articleId }: { articleId: string }) {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`article-${articleId}`, {
      config: { presence: { key: crypto.randomUUID() } },
    })
    channel
      .on('presence', { event: 'sync' }, () => {
        setCount(Object.keys(channel.presenceState()).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })
    return () => { supabase.removeChannel(channel) }
  }, [articleId])

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-[#1a7a3e] bg-[#e6f5ec] px-2.5 py-1 rounded-full font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1a7a3e] live-dot" />
      {count} číta teraz
    </div>
  )
}
