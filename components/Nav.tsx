'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm px-3.5 py-1.5 rounded-[6px] transition-colors duration-150 ${
        pathname === href
          ? 'text-[#0e0e0e] font-medium'
          : 'text-[#7a7770] hover:bg-[#f2f1ee] hover:text-[#0e0e0e]'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-[#fafaf8] border-b border-[#e4e2dc] flex items-center justify-between px-10 h-[60px]">
      <Link href="/" className="font-serif text-[22px] text-[#0e0e0e] no-underline tracking-tight">
        PR<span className="text-[#c8502a]">platforma</span>.sk
      </Link>

      <div className="flex items-center gap-1.5">
        {link('/', 'Všetky články')}
        {user && link('/pridat', 'Pridať článok')}
        {user && link('/profil', 'Môj profil')}
      </div>

      <div className="flex gap-2">
        {user ? (
          <button
            onClick={signOut}
            className="bg-transparent text-[#0e0e0e] border border-[#e4e2dc] rounded-[6px] px-4 py-2 text-sm font-medium hover:bg-[#f2f1ee] transition-colors"
          >
            Odhlásiť sa
          </button>
        ) : (
          <>
            <Link
              href="/auth/prihlasenie"
              className="bg-transparent text-[#0e0e0e] border border-[#e4e2dc] rounded-[6px] px-4 py-2 text-sm font-medium hover:bg-[#f2f1ee] transition-colors"
            >
              Prihlásiť sa
            </Link>
            <Link
              href="/auth/registracia"
              className="bg-[#0e0e0e] text-[#fafaf8] rounded-[6px] px-4 py-2 text-sm font-medium hover:bg-[#3a3834] transition-colors ml-2"
            >
              Registrácia zadarmo
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
