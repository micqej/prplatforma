const SK_MAP: Record<string, string> = {
  á: 'a', ä: 'a', č: 'c', ď: 'd', é: 'e', í: 'i',
  ľ: 'l', ĺ: 'l', ň: 'n', ó: 'o', ô: 'o', ŕ: 'r',
  š: 's', ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((c) => SK_MAP[c] ?? c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function uniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = toSlug(base)
  let exists = await checkExists(slug)
  let counter = 2
  while (exists) {
    slug = `${toSlug(base)}-${counter}`
    exists = await checkExists(slug)
    counter++
  }
  return slug
}
