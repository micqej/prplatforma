# PRplatforma.sk

Bezplatná PR platforma pre slovenské firmy. Publikuj PR články, buduj autoritu, získavaj zákazníkov.

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** — databáza + autentifikácia
- **Cloudflare R2** — storage pre obrázky
- **Tiptap** — WYSIWYG editor
- **Vercel** — deployment

---

## 1. Supabase setup

1. Vytvor projekt na [supabase.com](https://supabase.com)
2. V SQL Editore spusti celý súbor `supabase/schema.sql`
3. Skopíruj `Project URL` a `anon` kľúč zo **Settings → API**
4. Skopíruj `service_role` kľúč (pre server-side operácie)
5. V **Authentication → URL Configuration** nastav:
   - Site URL: `https://prplatforma.sk`
   - Redirect URLs: `https://prplatforma.sk/**`

---

## 2. Cloudflare R2 setup

1. V Cloudflare dashboarde otvor **R2 → Create bucket** — pomenuj ho `prplatforma-images`
2. Nastav bucket ako **verejný** (Public access → Allow)
3. Napoj vlastnú doménu: **Settings → Custom domains → Connect domain** → `images.prplatforma.sk`
4. Vytvor API token: **R2 → Manage R2 API Tokens → Create API Token** (povolenia: Object Read & Write)
5. Skopíruj `Account ID`, `Access Key ID`, `Secret Access Key`

---

## 3. Lokálny vývoj

```bash
cp .env.example .env.local
# Vyplň hodnoty v .env.local

npm install
npm run dev
```

App beží na [http://localhost:3000](http://localhost:3000)

---

## 4. Vercel deployment

### A) Cez GitHub (odporúčané)

1. Push kód na GitHub
2. Na [vercel.com](https://vercel.com) → **Add New Project** → importuj repo
3. Pridaj všetky environment variables z `.env.example`
4. Klikni **Deploy**

### B) Cez CLI

```bash
npm i -g vercel
vercel
# Nastaví projekt, deployuje preview

vercel --prod
# Production deploy
```

### Environment variables na Verceli

Nastav tieto premenné v **Project → Settings → Environment Variables**:

| Premenná | Popis |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key |
| `R2_BUCKET_NAME` | Názov R2 bucketu |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Verejná URL bucketu (napr. `https://images.prplatforma.sk`) |

---

## 5. Štruktúra projektu

```
app/
  (main)/           # Hlavný layout s Nav + Footer
    page.tsx        # Homepage
    clanky/[slug]/  # Detail článku
    pridat/         # Nový článok (auth required)
    upravit/[id]/   # Editácia článku (owner only)
    profil/         # Moje články + štatistiky
  auth/
    prihlasenie/    # Login
    registracia/    # Registrácia
  api/
    upload/         # Presigned URL pre R2
    views/[slug]/   # Inkrement view count
  sitemap.ts        # Auto-generovaný sitemap
  robots.ts         # robots.txt
components/
  Nav.tsx
  Footer.tsx
  ArticleForm.tsx   # Zdieľaný formulár (pridať + upraviť)
  CategoryFilter.tsx
  ViewCounter.tsx   # Client-side view tracking
  LiveReaders.tsx   # Realtime počet čitateľov (Supabase Presence)
  editor/
    RichEditor.tsx  # Tiptap editor s R2 upload
lib/
  supabase/
    client.ts       # Browser client
    server.ts       # Server client (RSC / Route Handlers)
  slug.ts           # SK slug generátor
supabase/
  schema.sql        # SQL schéma + RLS + seed dáta
```
