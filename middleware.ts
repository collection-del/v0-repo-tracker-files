# REPO PRO — Integration Guide
## Forgot Password + Realtime + Global RLS

---

## STEP 1 — Copy files into your project

```
app/auth/forgot-password/page.tsx   ← new page
app/auth/reset-password/page.tsx    ← new page
app/auth/callback/route.ts          ← new API route (REQUIRED)
hooks/use-realtime.ts               ← realtime hooks
middleware.ts                       ← replace your current one
supabase/setup.sql                  ← run once in SQL Editor
```

---

## STEP 2 — Run the SQL

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor → New query**
3. Paste the contents of `supabase/setup.sql`
4. Click **Run**

This enables Realtime on both tables and sets global RLS policies.

---

## STEP 3 — Configure Supabase Auth redirects

In your **Supabase Dashboard**:
1. Go to **Authentication → URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://YOUR-APP.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL** to your production URL:
   ```
   https://YOUR-APP.vercel.app
   ```

---

## STEP 4 — Add "¿Olvidaste tu contraseña?" to your login page

In `app/auth/login/page.tsx`, after your password `<input>`, add:

```tsx
import Link from "next/link"

// After the password input:
<div className="flex justify-end mt-1">
  <Link
    href="/auth/forgot-password"
    className="text-[10px] font-semibold text-[#7788aa] hover:text-[#c2ff00] transition-colors tracking-wide"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>
```

---

## STEP 5 — Add Realtime to your AppShell

In your `AppShell` or whichever **Client Component** owns repos/inventory state:

```tsx
"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeAll } from "@/hooks/use-realtime"
import { isAdmin } from "@/lib/utils"

// 1. Load initial data
useEffect(() => {
  const supabase = createClient()
  supabase.from("repos").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setRepos(data ?? []))
}, [])

// 2. Subscribe to changes
useRealtimeAll({
  onRepo: ({ eventType, new: n, old: o }) => {
    setRepos(prev => {
      if (eventType === "INSERT" && n) return [n, ...prev]
      if (eventType === "DELETE" && o?.id) return prev.filter(r => r.id !== o.id)
      if (eventType === "UPDATE" && n) return prev.map(r => r.id === n.id ? n : r)
      return prev
    })
  },
  onInventory: ({ eventType, new: n, old: o }) => {
    setInventory(prev => {
      if (eventType === "INSERT" && n) return [n, ...prev]
      if (eventType === "DELETE" && o?.id) return prev.filter(i => i.id !== o.id)
      if (eventType === "UPDATE" && n) return prev.map(i => i.id === n.id ? n : i)
      return prev
    })
  },
})

// 3. Show Bono only to admin
const admin = isAdmin(user.email)
// Then in JSX:
// {admin && <BonoSection repos={repos} />}
```

---

## STEP 6 — Deploy to Vercel

```bash
git add .
git commit -m "feat: forgot password, realtime, global RLS"
git push
```

Vercel will auto-deploy. No new env variables needed.

---

## How the password reset flow works

```
User clicks "¿Olvidaste tu contraseña?"
  → /auth/forgot-password
  → supabase.auth.resetPasswordForEmail(email, { redirectTo: .../auth/callback })
  → Supabase sends email
  → User clicks link in email
  → /auth/callback?code=xxx  (your new route handler)
  → exchangeCodeForSession(code)
  → redirect to /auth/reset-password
  → User sets new password
  → supabase.auth.updateUser({ password })
  → redirect to /  (dashboard)
```

---

## Bono visibility rules

| User | Bono visible |
|------|-------------|
| collection@amigocash.com | ✅ Yes |
| Any other logged-in user | ❌ No |

Controlled by `isAdmin(user.email)` in `@/lib/utils` — already in your codebase.
