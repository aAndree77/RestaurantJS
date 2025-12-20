"use client"

import { useState, useEffect } from "react"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ pages: 1, total: 0 })
  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ total: 0, users: 0, vip: 0, banned: 0, admins: 0 })

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        role: roleFilter,
        sortBy: "createdAt",
        sortOrder: "desc"
      })

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
        setPagination(data.pagination)
        
        // Calculează statisticile
        if (!roleFilter && !search) {
          const userCount = data.users.filter(u => !u.adminRole && (u.role === "user" || !u.role)).length
          const vipCount = data.users.filter(u => !u.adminRole && u.role === "vip").length
          const bannedCount = data.users.filter(u => u.role === "banned").length
          const adminCount = data.users.filter(u => u.adminRole).length
          setStats({
            total: data.pagination.total,
            users: userCount,
            vip: vipCount,
            banned: bannedCount,
            admins: adminCount
          })
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId) => {
    if (!selectedRole) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole })
      })

      if (res.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: selectedRole } : u
        ))
        setEditingUser(null)
        setSelectedRole("")
      }
    } catch (error) {
      console.error("Error updating role:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Sigur vrei să ștergi utilizatorul ${userName || "acest utilizator"}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const getRoleBadge = (user) => {
    const role = user.displayRole || user.role || "user"
    
    switch (role) {
      case "super_admin":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
            👑 Super Admin
          </span>
        )
      case "admin":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
            🛡️ Admin
          </span>
        )
      case "moderator":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
            🔧 Moderator
          </span>
        )
      case "vip":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
            ⭐ VIP
          </span>
        )
      case "banned":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
            🚫 Blocat
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full">
            Utilizator
          </span>
        )
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilizatori</h1>
          <p className="text-slate-400 mt-1">
            Gestionează toți utilizatorii înregistrați pe site
          </p>
        </div>
      </div>

      {/* Statistici */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pagination.total}</p>
              <p className="text-sm text-slate-400">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-lg">👑</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.admins}</p>
              <p className="text-sm text-slate-400">Admini</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.users}</p>
              <p className="text-sm text-slate-400">Utilizatori</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.vip}</p>
              <p className="text-sm text-slate-400">VIP</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-lg">🚫</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.banned}</p>
              <p className="text-sm text-slate-400">Blocați</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Caută după nume sau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Role filter */}
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Toate rolurile</option>
              <option value="user">Utilizatori</option>
              <option value="vip">VIP</option>
              <option value="banned">Blocați</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel utilizatori */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-400">Nu s-au găsit utilizatori</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Utilizator</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Comenzi</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Înregistrat</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                              <span className="text-lg font-medium text-white">
                                {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{user.name || "Fără nume"}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-300">{user.phone || "-"}</p>
                          <p className="text-slate-500 truncate max-w-[200px]">{user.address || "-"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="">Selectează...</option>
                              <option value="user">Utilizator</option>
                              <option value="vip">⭐ VIP</option>
                              <option value="banned">🚫 Blocat</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(user.id)}
                              disabled={saving || !selectedRole}
                              className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setEditingUser(null); setSelectedRole(""); }}
                              className="p-1 text-slate-400 hover:text-slate-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          getRoleBadge(user)
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{user._count?.orders || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!user.adminRole && (
                            <button
                              onClick={() => { setEditingUser(user.id); setSelectedRole(user.role || "user"); }}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Schimbă rol"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                          {user.adminRole && (
                            <span className="text-xs text-slate-500 italic px-2">
                              Gestionează din Administratori
                            </span>
                          )}
                          {!user.adminRole && (
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Șterge"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-700">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
                          <span className="text-lg font-medium text-white">
                            {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{user.name || "Fără nume"}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <div className="mt-1">{getRoleBadge(user)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!user.adminRole && (
                        <>
                          <button
                            onClick={() => { setEditingUser(user.id); setSelectedRole(user.role || "user"); }}
                            className="p-2 text-slate-400 hover:text-amber-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-2 text-slate-400 hover:text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingUser === user.id && (
                    <div className="mt-3 flex items-center gap-2 bg-slate-700/50 p-3 rounded-lg">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Selectează rol...</option>
                        <option value="user">Utilizator</option>
                        <option value="vip">⭐ VIP</option>
                        <option value="banned">🚫 Blocat</option>
                      </select>
                      <button
                        onClick={() => handleRoleChange(user.id)}
                        disabled={saving || !selectedRole}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50"
                      >
                        Salvează
                      </button>
                      <button
                        onClick={() => { setEditingUser(null); setSelectedRole(""); }}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg"
                      >
                        Anulează
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                    <span>{user._count?.orders || 0} comenzi</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginare */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Pagina {page} din {pagination.pages} ({pagination.total} utilizatori)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
