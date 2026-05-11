'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Category { id: string; name: string; slug: string }

function Filter({ categories, active }: { categories: Category[]; active: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(slug: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (slug === 'vsetky') p.delete('kategoria')
    else p.set('kategoria', slug)
    router.push(`/?${p.toString()}`)
  }

  const pill = (slug: string, label: string) => (
    <button
      key={slug}
      onClick={() => select(slug)}
      className={`text-[13px] px-3.5 py-[5px] rounded-full border transition-all duration-150 font-sans ${
        active === slug
          ? 'bg-[#0e0e0e] text-[#fafaf8] border-[#0e0e0e]'
          : 'bg-[#fafaf8] text-[#3a3834] border-[#e4e2dc] hover:border-[#b0ada4]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="px-10 py-5 border-b border-[#e4e2dc] flex gap-2 items-center flex-wrap">
      <span className="text-[13px] text-[#7a7770] mr-1">Kategória:</span>
      {pill('vsetky', 'Všetky')}
      {categories.map((c) => pill(c.slug, c.name))}
    </div>
  )
}

export default function CategoryFilter(props: { categories: Category[]; active: string }) {
  return (
    <Suspense fallback={null}>
      <Filter {...props} />
    </Suspense>
  )
}
