"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function AdminLoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verifică dacă a fost deconectat pentru lipsă acces
    const errorParam = searchParams.get("error")
    if (errorParam === "no_access") {
      setError("Contul tău nu are acces la panoul de administrare. Te rugăm să te conectezi cu un cont autorizat.")
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.user?.email && !error) {
      checkAdminAccess()
    }
  }, [session])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        // Verifică accesul admin după autentificare
        checkAdminAccess()
      }
    } catch (err) {
      setError("Eroare la autentificare")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminAccess = async () => {
    setChecking(true)
    try {
      const res = await fetch("/api/admin/check")
      const data = await res.json()
      
      if (data.isAdmin) {
        router.push("/admin")
      } else {
        setError("Nu ai acces la panoul de administrare.")
      }
    } catch (err) {
      setError("Eroare la verificarea accesului.")
    } finally {
      setChecking(false)
    }
  }

  if (status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/25 mb-4">
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop" 
              alt="La Bella Italia"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">La Bella Italia - Ristorante</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  signIn("google", { callbackUrl: "/admin/login" })
                }}
                className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                Încearcă alt cont
              </button>
            </div>
          ) : session ? (
            <div className="text-center">
              <p className="text-slate-300 mb-4">Verificare acces...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Autentificare Administrator
              </h2>

              {/* Formular Email/Parolă */}
              <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="admin@exemplu.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Parolă</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Se conectează...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Conectare
                    </>
                  )}
                </button>
              </form>

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/50 text-slate-400">sau</span>
                </div>
              </div>
              
              <button
                onClick={() => signIn("google", { callbackUrl: "/admin/login" })}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Conectare cu Google
              </button>

              <p className="text-slate-500 text-sm text-center mt-6">
                Doar administratorii autorizați pot accesa acest panou.
              </p>
            </>
          )}
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a href="/" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
            ← Înapoi la site
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
