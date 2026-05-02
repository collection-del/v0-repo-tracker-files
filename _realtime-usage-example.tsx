import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

// This route is hit when Supabase redirects back after:
//   - Email confirmation
//   - Password recovery (magic link)
//   - OAuth sign-in
//
// Make sure your Supabase dashboard has this URL in:
//   Authentication → URL Configuration → Redirect URLs
//   e.g.  https://yourapp.vercel.app/auth/callback
//         http://localhost:3000/auth/callback

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component – ignored
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password recovery → send to reset page
      if (next.startsWith("/auth/reset-password")) {
        return NextResponse.redirect(new URL("/auth/reset-password", request.url))
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Fallback: something went wrong
  return NextResponse.redirect(
    new URL("/auth/forgot-password?error=link-expired", request.url)
  )
}
