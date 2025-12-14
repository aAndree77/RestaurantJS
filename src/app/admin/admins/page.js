"use client"

import { useEffect, useState } from "react"

export default function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ 
    email: "", 
    name: "", 
    role: "admin",
    authType: "google",
    password: "",
    confirmPassword: ""
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [currentAdmin, setCurrentAdmin] = useState(null)

  useEffect(() => {
    fetchAdmins()
    checkCurrentAdmin()
  }, [])

  const checkCurrentAdmin = async () => {
    try {
      const res = await fetch("/api/admin/check")
      const data = await res.json()
      setCurrentAdmin(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins")
      const data = await res.json()
      setAdmins(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validare pentru credentials
    if (formData.authType === "credentials") {
      if (!formData.password || formData.password.length < 6) {
        setError("Parola trebuie să aibă minim 6 caractere")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Parolele nu coincid")
        return
      }
    }

    setSaving(true)

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          authType: formData.authType,
          password: formData.authType === "credentials" ? formData.password : null
        })
      })

      const data = await res.json()

      if (res.ok) {
        setAdmins([...admins, data])
        setShowModal(false)
        setFormData({ 
          email: "", 
          name: "", 
          role: "admin",
          authType: "google",
          password: "",
          confirmPassword: ""
        })
      } else {
        setError(data.error || "Eroare la adăugarea adminului")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Eroare la adăugarea adminului")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest admin?")) return

    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })

      if (res.ok) {
        setAdmins(admins.map(a => a.id === id ? { ...a, role: newRole } : a))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      admin: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      moderator: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      moderator: "Moderator"
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  const isSuperAdmin = currentAdmin?.role === "super_admin"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Administrare admini</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gestionează utilizatorii cu acces la panou</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adaugă admin
          </button>
        )}
      </div>

      {/* Super Admin Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm md:text-base truncate">andreiinsuratalu87@gmail.com</h3>
            <p className="text-slate-400 text-xs md:text-sm">Super Admin (permanent)</p>
          </div>
          <div className="mt-2 sm:mt-0">
            {getRoleBadge("SUPER_ADMIN")}
          </div>
        </div>
      </div>

      {/* Admins List - Tabel pe desktop */}
      <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-medium">Admin</th>
                <th className="text-left p-4 text-slate-400 font-medium">Rol</th>
                <th className="text-left p-4 text-slate-400 font-medium">Adăugat</th>
                {isSuperAdmin && (
                  <th className="text-right p-4 text-slate-400 font-medium">Acțiuni</th>
                )}
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-slate-400">Nu există alți admini</p>
                      {isSuperAdmin && (
                        <p className="text-slate-500 text-sm">Adaugă primul admin</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {admin.image ? (
                          <img 
                            src={admin.image} 
                            alt={admin.name || admin.email}
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-amber-500 font-semibold">
                              {admin.name?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{admin.name || "Fără nume"}</p>
                          <p className="text-slate-400 text-sm">{admin.email}</p>
                          <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${
                            admin.authType === "credentials" ? "text-blue-400" : "text-green-400"
                          }`}>
                            {admin.authType === "credentials" ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email/Parolă
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                </svg>
                                Google
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isSuperAdmin ? (
                        <select
                          value={admin.role}
                          onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      ) : (
                        getRoleBadge(admin.role)
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(admin.createdAt).toLocaleDateString("ro-RO")}
                    </td>
                    {isSuperAdmin && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Șterge"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admins List - Carduri pe mobil */}
      <div className="md:hidden space-y-3">
        {admins.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <svg className="w-12 h-12 text-slate-600 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-400">Nu există alți admini</p>
            {isSuperAdmin && (
              <p className="text-slate-500 text-sm">Adaugă primul admin</p>
            )}
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                {admin.image ? (
                  <img 
                    src={admin.image} 
                    alt={admin.name || admin.email}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-500 font-semibold">
                      {admin.name?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{admin.name || "Fără nume"}</p>
                  <p className="text-slate-400 text-sm truncate">{admin.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {isSuperAdmin ? (
                      <select
                        value={admin.role}
                        onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    ) : (
                      getRoleBadge(admin.role)
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      admin.authType === "credentials" ? "text-blue-400" : "text-green-400"
                    }`}>
                      {admin.authType === "credentials" ? "Email" : "Google"}
                    </span>
                  </div>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-white">Adaugă admin nou</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tip autentificare */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tip autentificare
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, authType: "google", password: "", confirmPassword: "" })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      formData.authType === "google"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, authType: "credentials" })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      formData.authType === "credentials"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email & Parolă
                  </button>
                </div>
                <p className="mt-2 text-slate-500 text-xs">
                  {formData.authType === "google" 
                    ? "Adminul se va autentifica cu contul Google" 
                    : "Adminul se va autentifica cu email și parolă"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                {formData.authType === "google" && (
                  <p className="mt-2 text-slate-500 text-xs">
                    Numele va fi preluat automat din profilul Google la prima autentificare
                  </p>
                )}
              </div>

              {/* Câmpuri parolă și nume - doar pentru credentials */}
              {formData.authType === "credentials" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nume (opțional)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ion Popescu"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Parolă *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Minim 6 caractere"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirmă parola *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      placeholder="Repetă parola"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                >
                  <option value="admin">Admin - Acces complet</option>
                  <option value="moderator">Moderator - Acces limitat</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Se salvează...
                    </>
                  ) : (
                    "Adaugă admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
