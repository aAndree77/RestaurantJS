"use client"

import { useEffect, useState, useRef } from "react"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [allImages, setAllImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: "", image: "" })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
    fetchImages()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories")
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/categories/upload")
      const data = await res.json()
      setAllImages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching images:", error)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const res = await fetch("/api/admin/categories/upload", {
        method: "POST",
        body: formDataUpload
      })

      const data = await res.json()

      if (res.ok) {
        setAllImages(prev => [data, ...prev])
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        setError(data.error || "Eroare la upload")
      }
    } catch (error) {
      console.error("Error uploading:", error)
      setError("Eroare la upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      const res = await fetch(`/api/admin/categories/upload?id=${imageId}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (res.ok) {
        const deletedImage = allImages.find(img => img.id === imageId)
        setAllImages(prev => prev.filter(img => img.id !== imageId))
        if (deletedImage && formData.image === deletedImage.url) {
          setFormData(prev => ({ ...prev, image: allImages[0]?.url || "" }))
        }
        setDeleteConfirm(null)
      } else {
        setError(data.error || "Eroare la ștergere")
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error("Error deleting:", error)
      setError("Eroare la ștergere")
      setDeleteConfirm(null)
    }
  }

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, image: category.image || allImages[0]?.url || "" })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", image: allImages[0]?.url || "" })
    }
    setShowModal(true)
    setError(null)
    setDeleteConfirm(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"
      
      const res = await fetch(url, {
        method: editingCategory ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          image: formData.image
        })
      })

      const data = await res.json()

      if (res.ok) {
        if (editingCategory) {
          setCategories(categories.map(c => c.id === data.id ? data : c))
        } else {
          setCategories([...categories, data])
        }
        setShowModal(false)
      } else {
        setError(data.error || "Eroare la salvare")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Eroare la salvare")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi această categorie? Toate produsele asociate vor rămâne fără categorie.")) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

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
          <h1 className="text-xl md:text-2xl font-bold text-white">Categorii</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gestionează categoriile de produse</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-sm md:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adaugă categorie
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={category.image || allImages[0]?.url || "https://via.placeholder.com/56"} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">{category.name}</h3>
            <p className="text-slate-400 text-sm">
              {category._count?.menuItems || 0} produse
            </p>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-white font-semibold text-lg mb-2">Nicio categorie</h3>
              <p className="text-slate-400 mb-4">Adaugă prima categorie pentru a organiza produsele</p>
              <button
                onClick={() => openModal()}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Adaugă categorie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCategory ? "Editează categorie" : "Categorie nouă"}
              </h2>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nume categorie *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="ex: Pizza, Deserturi, Băuturi"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Imagine categorie
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-lg cursor-pointer hover:bg-amber-500/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? "Se încarcă..." : "Încarcă imagine"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Toate imaginile disponibile */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {allImages.map((img) => (
                    <div key={img.id} className="relative group/img">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: img.url })}
                        className={`relative aspect-square rounded-xl overflow-hidden transition-all w-full ${
                          formData.image === img.url
                            ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-800 scale-105"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        }`}
                        title={img.name || "Imagine"}
                      >
                        <img 
                          src={img.url} 
                          alt={img.name || "Imagine"}
                          className="w-full h-full object-cover"
                        />
                        {formData.image === img.url && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(img.id); }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                        title="Șterge imaginea"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {allImages.find(i => i.url === formData.image)?.name || "Selectează o imagine"}
                </p>
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
                    editingCategory ? "Salvează" : "Adaugă"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmare ștergere imagine */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Șterge imaginea?</h3>
              <p className="text-slate-400 text-sm mb-6">Această acțiune nu poate fi anulată.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleDeleteImage(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
