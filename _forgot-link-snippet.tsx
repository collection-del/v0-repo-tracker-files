"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setStatus("error")
      setErrorMsg(error.message)
    } else {
      setStatus("sent")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03040a] px-4">
      {/* Grid background */}
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
          <div className="inline-flex items-center gap-3 mb-2">
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
          {status === "sent" ? (
            /* ── SUCCESS STATE ── */
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2
                className="text-xl text-[#c2ff00] mb-2 tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Revisa tu correo
              </h2>
              <p className="text-[#7788aa] text-sm mb-6">
                Te enviamos un enlace a{" "}
                <span className="text-[#dde3f0] font-medium">{email}</span> para
                restablecer tu contraseña. Puede tardar un par de minutos.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-[#c2ff00] text-sm font-semibold hover:underline"
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <>
              <h2
                className="text-xl text-[#c2ff00] mb-1 tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive" }}
              >
                Recuperar contraseña
              </h2>
              <p className="text-[#7788aa] text-sm mb-6">
                Ingresa tu correo y te enviamos un enlace para crear una nueva
                contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-[2px] uppercase text-[#7788aa]">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="bg-[#141822] border border-[#1c2538] rounded-lg px-4 py-3 text-[#dde3f0] text-sm placeholder:text-[#3a4560] focus:outline-none focus:border-[#c2ff00] focus:shadow-[0_0_0_3px_rgba(194,255,0,0.07)] transition-all"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3 text-[#ef4444] text-sm">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#c2ff00] text-black font-bold py-3 rounded-lg text-sm tracking-wide hover:bg-[#d8ff40] transition-all hover:shadow-[0_0_20px_rgba(194,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>

              <p className="text-center text-[#3a4560] text-sm mt-6">
                <Link
                  href="/auth/login"
                  className="text-[#7788aa] hover:text-[#c2ff00] transition-colors"
                >
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
