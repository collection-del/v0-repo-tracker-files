"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Status = "loading" | "ready" | "saving" | "success" | "error" | "invalid"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>("loading")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Supabase puts the session in the URL hash after the email redirect.
    // The browser client picks it up automatically — we just need to
    // verify a session actually exists before showing the form.
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready")
      } else if (event === "SIGNED_IN") {
        // Already handled by PASSWORD_RECOVERY; ignore
      }
    })

    // Fallback: if the hash has already been consumed, getSession will work
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready")
      else setStatus("invalid")
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.")
      return
    }

    setStatus("saving")
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus("ready")
      setErrorMsg(error.message)
    } else {
      setStatus("success")
      setTimeout(() => router.replace("/"), 2500)
    }
  }

  /* ── Strength indicator ── */
  const strength = (p: string) => {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const str = strength(password)
  const strColor = ["", "#ef4444", "#ff6b35", "#facc15", "#22c55e"][str] || ""
  const strLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][str] || ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03040a] px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(28,34,56,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(28,34,56,.2) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c2ff00] rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(194,255,0,0.4)]">
              🚗
            </div>
            <span
              className="text-2xl tracking-[6px] text-[#c2ff00]"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                textShadow: "0 0 15px rgba(194,255,0,0.5)",
              }}
            >
              REPO PRO
            </span>
          </div>
        </div>

        <div className="bg-[#0e1118] border border-[#1c2538] rounded-2xl p-8 shadow-2xl">
          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#c2ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#7788aa] text-sm">Verificando enlace…</p>
            </div>
          )}

          {/* ── INVALID LINK ── */}
          {status === "invalid" && (
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2
                className="text-xl text-[#ef4444] mb-2 tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Enlace inválido
              </h2>
              <p className="text-[#7788aa] text-sm mb-6">
                Este enlace ya expiró o fue usado. Solicita uno nuevo.
              </p>
              <a
                href="/auth/forgot-password"
                className="inline-block bg-[#c2ff00] text-black font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-[#d8ff40] transition-all"
              >
                Solicitar nuevo enlace
              </a>
            </div>
          )}

          {/* ── FORM ── */}
          {(status === "ready" || status === "saving") && (
            <>
              <h2
                className="text-xl text-[#c2ff00] mb-1 tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Nueva contraseña
              </h2>
              <p className="text-[#7788aa] text-sm mb-6">
                Elige una contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-[2px] uppercase text-[#7788aa]">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-[#141822] border border-[#1c2538] rounded-lg px-4 py-3 pr-12 text-[#dde3f0] text-sm placeholder:text-[#3a4560] focus:outline-none focus:border-[#c2ff00] focus:shadow-[0_0_0_3px_rgba(194,255,0,0.07)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4560] hover:text-[#7788aa] text-lg"
                    >
                      {show ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: i <= str ? strColor : "#1c2538",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: strColor }}
                      >
                        {strLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-[2px] uppercase text-[#7788aa]">
                    Confirmar contraseña
                  </label>
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="bg-[#141822] border border-[#1c2538] rounded-lg px-4 py-3 text-[#dde3f0] text-sm placeholder:text-[#3a4560] focus:outline-none focus:border-[#c2ff00] focus:shadow-[0_0_0_3px_rgba(194,255,0,0.07)] transition-all"
                  />
                  {confirm && password !== confirm && (
                    <p className="text-[10px] text-[#ef4444]">
                      Las contraseñas no coinciden
                    </p>
                  )}
                  {confirm && password === confirm && confirm.length > 0 && (
                    <p className="text-[10px] text-[#22c55e]">✓ Coinciden</p>
                  )}
                </div>

                {errorMsg && (
                  <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3 text-[#ef4444] text-sm">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "saving"}
                  className="w-full bg-[#c2ff00] text-black font-bold py-3 rounded-lg text-sm tracking-wide hover:bg-[#d8ff40] transition-all hover:shadow-[0_0_20px_rgba(194,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {status === "saving" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Guardando…
                    </span>
                  ) : (
                    "Guardar contraseña"
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">✅</div>
              <h2
                className="text-xl text-[#22c55e] mb-2 tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                ¡Contraseña actualizada!
              </h2>
              <p className="text-[#7788aa] text-sm">
                Redirigiendo al dashboard…
              </p>
              <div className="w-6 h-6 border-2 border-[#c2ff00] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
