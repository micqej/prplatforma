'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/profil')
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-10 bg-[#f2f1ee]">
      <div className="bg-[#fafaf8] border border-[#e4e2dc] rounded-xl p-10 w-full max-w-[400px]">
        <div className="font-serif text-xl mb-7 text-[#0e0e0e]">PR<span className="text-[#c8502a]">platforma</span>.sk</div>
        <h1 className="font-serif text-[26px] mb-1">Prihlásiť sa</h1>
        <p className="text-sm text-[#7a7770] mb-7 font-light">Vitaj späť</p>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-[6px] px-4 py-2">{error}</div>}

        <form onSubmit={submit}>
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="peter@firma.sk" required
              className="w-full bg-[#fafaf8] border border-[#e4e2dc] rounded-[6px] px-3.5 py-2.5 text-[15px] outline-none focus:border-[#0e0e0e]" />
          </div>
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#3a3834] mb-1.5">Heslo</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-[#fafaf8] border border-[#e4e2dc] rounded-[6px] px-3.5 py-2.5 text-[15px] outline-none focus:border-[#0e0e0e]" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0e0e0e] text-[#fafaf8] rounded-[6px] py-3 text-sm font-medium hover:bg-[#3a3834] transition-colors disabled:opacity-50">
            {loading ? 'Prihlasovanie...' : 'Prihlásiť sa →'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#7a7770] mt-5">
          Nemáš účet?{' '}
          <Link href="/auth/registracia" className="text-[#0e0e0e] font-medium hover:text-[#c8502a]">Zaregistruj sa zadarmo</Link>
        </p>
      </div>
    </div>
  )
}
