"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export default function ChatPage() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [admins, setAdmins] = useState([])
  const [generalChatId, setGeneralChatId] = useState(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const [editingMessage, setEditingMessage] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true) // Pentru mobil
  const [longPressMenu, setLongPressMenu] = useState(null) // {messageId, x, y} pentru meniu context mobil
  const [showScrollButton, setShowScrollButton] = useState(false) // Buton scroll la ultimul mesaj
  const [userScrolledUp, setUserScrolledUp] = useState(false) // Dacă utilizatorul a dat scroll în sus
  
  // State-uri pentru editarea grupului
  const [editGroupName, setEditGroupName] = useState("")
  const [editGroupImage, setEditGroupImage] = useState(null)
  const [editGroupImagePreview, setEditGroupImagePreview] = useState(null)
  const [savingGroup, setSavingGroup] = useState(false)
  
  // State-uri pentru crearea grupului nou (inclusiv imagine)
  const [newGroupImage, setNewGroupImage] = useState(null)
  const [newGroupImagePreview, setNewGroupImagePreview] = useState(null)
  const [creatingGroup, setCreatingGroup] = useState(false)
  
  // State-uri pentru modal de confirmare
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'removeMember' | 'deleteGroup', data: any }
  
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const groupImageInputRef = useRef(null)
  const newGroupImageInputRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const longPressTimerRef = useRef(null)
  const inputRef = useRef(null)

  // Long press handlers
  const handleTouchStart = useCallback((e, message, isOwn) => {
    if (!isOwn || message.isDeleted) return
    if ((new Date() - new Date(message.createdAt)) >= 5 * 60 * 1000) return
    
    const touch = e.touches[0]
    longPressTimerRef.current = setTimeout(() => {
      e.preventDefault()
      setLongPressMenu({
        messageId: message.id,
        content: message.content,
        x: touch.clientX,
        y: touch.clientY
      })
    }, 500) // 500ms pentru long press
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  // Ref pentru a ține evidența timpului când meniul a fost deschis
  const menuOpenTimeRef = useRef(null)

  // Închide meniul când se apasă în altă parte
  useEffect(() => {
    if (longPressMenu) {
      // Setăm timpul când meniul a fost deschis
      menuOpenTimeRef.current = Date.now()
    }
    
    const handleClickOutside = (e) => {
      if (longPressMenu) {
        // Prevenim închiderea imediată - așteptăm 300ms după deschiderea meniului
        const timeSinceOpen = Date.now() - (menuOpenTimeRef.current || 0)
        if (timeSinceOpen < 300) {
          return
        }
        setLongPressMenu(null)
      }
    }
    
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [longPressMenu])

  // Funcție pentru a începe editarea (folosită și pe mobil)
  const startEditing = useCallback((messageId, content) => {
    setEditingMessage(messageId)
    setEditContent(content || "")
    setNewMessage(content || "") // Pune mesajul în input-ul principal
    setLongPressMenu(null)
    // Focus pe input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }, [])

  // Funcție pentru a șterge din meniul mobil
  const handleMobileDelete = useCallback((messageId) => {
    setLongPressMenu(null)
    handleDeleteMessage(messageId)
  }, [])

  // Inițializare
  useEffect(() => {
    initChat()
  }, [])

  // Polling pentru mesaje noi
  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.id)
      
      // Poll la fiecare 3 secunde
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedGroup.id, true)
      }, 3000)
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [selectedGroup?.id])

  // Scroll la ultimul mesaj - doar dacă utilizatorul nu a dat scroll în sus
  useEffect(() => {
    if (messagesEndRef.current && !userScrolledUp) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, userScrolledUp])

  // Handler pentru scroll în zona mesajelor
  const handleMessagesScroll = useCallback(() => {
    if (!messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    setShowScrollButton(!isAtBottom)
    setUserScrolledUp(!isAtBottom)
  }, [])

  // Scroll la ultimul mesaj (manual)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      setShowScrollButton(false)
      setUserScrolledUp(false)
    }
  }, [])

  const initChat = async () => {
    try {
      const res = await fetch("/api/admin/chat/init")
      const data = await res.json()
      
      if (res.ok) {
        setCurrentAdmin(data.currentAdmin)
        setAdmins(data.admins)
        setGeneralChatId(data.generalChatId)
        await fetchGroups()
      }
    } catch (error) {
      console.error("Error initializing chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/chat/groups")
      const data = await res.json()
      if (res.ok) {
        setGroups(data)
        
        // Selectează chatul general dacă există și nu e selectat nimic
        if (!selectedGroup && data.length > 0) {
          const general = data.find(g => g.type === "general")
          if (general) {
            setSelectedGroup(general)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const fetchMessages = async (groupId, silent = false) => {
    try {
      const res = await fetch(`/api/admin/chat/groups/${groupId}/messages`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    // Dacă suntem în modul editare, salvăm editarea
    if (editingMessage) {
      if (!newMessage.trim()) return
      
      setSending(true)
      try {
        const res = await fetch(`/api/admin/chat/messages/${editingMessage}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage.trim() })
        })

        if (res.ok) {
          const updated = await res.json()
          setMessages(messages.map(m => m.id === editingMessage ? updated : m))
          setEditingMessage(null)
          setEditContent("")
          setNewMessage("")
        }
      } catch (error) {
        console.error("Error editing message:", error)
      } finally {
        setSending(false)
      }
      return
    }
    
    if ((!newMessage.trim() && !selectedImage) || !selectedGroup || sending) return

    setSending(true)
    try {
      let imageUrl = null
      
      // Upload imagine dacă există
      if (selectedImage) {
        const formData = new FormData()
        formData.append("file", selectedImage)
        
        const uploadRes = await fetch("/api/admin/chat/upload", {
          method: "POST",
          body: formData
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      const res = await fetch(`/api/admin/chat/groups/${selectedGroup.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim() || null,
          image: imageUrl
        })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)
        fetchGroups()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = async (messageId) => {
    // Această funcție e folosită de inline edit din mesaj (desktop)
    if (!editContent.trim()) return

    try {
      const res = await fetch(`/api/admin/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      })

      if (res.ok) {
        const updated = await res.json()
        setMessages(messages.map(m => m.id === messageId ? updated : m))
        setEditingMessage(null)
        setEditContent("")
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error editing message:", error)
    }
  }

  // Funcția pentru a anula editarea
  const cancelEditing = () => {
    setEditingMessage(null)
    setEditContent("")
    setNewMessage("")
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Sigur vrei să ștergi acest mesaj?")) return

    try {
      const res = await fetch(`/api/admin/chat/messages/${messageId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, isDeleted: true, content: null, image: null } : m
        ))
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const handleStartChat = async (adminId) => {
    try {
      const res = await fetch("/api/admin/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "individual",
          memberIds: [adminId]
        })
      })

      if (res.ok) {
        const group = await res.json()
        await fetchGroups()
        setSelectedGroup(group)
        setShowNewChat(false)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return

    setCreatingGroup(true)
    try {
      let imageUrl = null
      
      // Upload imagine dacă există
      if (newGroupImage) {
        const formData = new FormData()
        formData.append("file", newGroupImage)
        
        const uploadRes = await fetch("/api/admin/chat/upload", {
          method: "POST",
          body: formData
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      const res = await fetch("/api/admin/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "group",
          name: groupName,
          image: imageUrl,
          memberIds: selectedMembers
        })
      })

      if (res.ok) {
        const group = await res.json()
        await fetchGroups()
        setSelectedGroup(group)
        setShowNewGroup(false)
        setGroupName("")
        setSelectedMembers([])
        setNewGroupImage(null)
        setNewGroupImagePreview(null)
      }
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    setConfirmModal({ type: 'deleteGroup', data: { groupId } })
  }

  const confirmDeleteGroup = async () => {
    if (!confirmModal || confirmModal.type !== 'deleteGroup') return
    const { groupId } = confirmModal.data

    try {
      const res = await fetch(`/api/admin/chat/groups/${groupId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setGroups(groups.filter(g => g.id !== groupId))
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null)
          setMessages([])
        }
        setShowGroupSettings(false)
      }
    } catch (error) {
      console.error("Error deleting group:", error)
    } finally {
      setConfirmModal(null)
    }
  }

  // Deschide modalul de setări grup
  const openGroupSettings = () => {
    if (selectedGroup) {
      setEditGroupName(selectedGroup.name || "")
      setEditGroupImagePreview(selectedGroup.image || null)
      setEditGroupImage(null)
      setShowGroupSettings(true)
    }
  }

  // Selectează imaginea grupului
  const handleGroupImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Fișierul este prea mare (max 5MB)")
        return
      }
      setEditGroupImage(file)
      setEditGroupImagePreview(URL.createObjectURL(file))
    }
  }

  // Salvează modificările grupului
  const handleSaveGroupSettings = async () => {
    if (!selectedGroup) return
    
    setSavingGroup(true)
    try {
      let imageUrl = selectedGroup.image
      
      // Upload imagine nouă dacă există
      if (editGroupImage) {
        const formData = new FormData()
        formData.append("file", editGroupImage)
        
        const uploadRes = await fetch("/api/admin/chat/upload", {
          method: "POST",
          body: formData
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      const res = await fetch(`/api/admin/chat/groups/${selectedGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGroupName,
          image: imageUrl
        })
      })

      if (res.ok) {
        // Actualizează grupul în liste
        const updatedGroup = {
          ...selectedGroup,
          name: editGroupName,
          image: imageUrl
        }
        setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g))
        setSelectedGroup(updatedGroup)
        setShowGroupSettings(false)
      }
    } catch (error) {
      console.error("Error saving group:", error)
    } finally {
      setSavingGroup(false)
    }
  }

  // Adaugă membru în grup
  const handleAddMember = async (memberId) => {
    if (!selectedGroup) return
    
    try {
      const res = await fetch(`/api/admin/chat/groups/${selectedGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addMembers: [memberId] })
      })

      if (res.ok) {
        const memberToAdd = admins.find(a => a.id === memberId)
        if (memberToAdd) {
          const updatedGroup = {
            ...selectedGroup,
            members: [...(selectedGroup.members || []), memberToAdd]
          }
          setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g))
          setSelectedGroup(updatedGroup)
        }
      }
    } catch (error) {
      console.error("Error adding member:", error)
    }
  }

  // Elimină membru din grup (cu modal de confirmare)
  const handleRemoveMember = async (memberId) => {
    if (!selectedGroup) return
    // Nu permite eliminarea propriei persoane
    if (memberId === currentAdmin?.id) return
    
    const member = selectedGroup.members?.find(m => m.id === memberId)
    setConfirmModal({ 
      type: 'removeMember', 
      data: { 
        memberId, 
        memberName: member?.name || member?.email || 'acest membru' 
      } 
    })
  }

  const confirmRemoveMember = async () => {
    if (!confirmModal || confirmModal.type !== 'removeMember' || !selectedGroup) return
    const { memberId } = confirmModal.data
    
    try {
      const res = await fetch(`/api/admin/chat/groups/${selectedGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeMembers: [memberId] })
      })

      if (res.ok) {
        const updatedGroup = {
          ...selectedGroup,
          members: (selectedGroup.members || []).filter(m => m.id !== memberId)
        }
        setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g))
        setSelectedGroup(updatedGroup)
      }
    } catch (error) {
      console.error("Error removing member:", error)
    } finally {
      setConfirmModal(null)
    }
  }

  // Selectează imaginea pentru grupul nou
  const handleNewGroupImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Fișierul este prea mare (max 5MB)")
        return
      }
      setNewGroupImage(file)
      setNewGroupImagePreview(URL.createObjectURL(file))
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Fișierul este prea mare (max 5MB)")
        return
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    
    if (isToday) {
      return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
    }
    return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  }

  const getGroupIcon = (group) => {
    // Dacă grupul are imagine custom, o afișăm
    if (group.image) {
      return (
        <img 
          src={group.image} 
          alt={group.name} 
          className="w-12 h-12 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      )
    }
    
    if (group.type === "general") {
      return (
        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      )
    }
    if (group.type === "group") {
      return (
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )
    }
    // Individual chat - show other person's avatar
    const otherMember = group.members?.find(m => m.id !== currentAdmin?.id)
    if (otherMember?.image) {
      return (
        <img 
          src={otherMember.image} 
          alt={otherMember.name} 
          className="w-12 h-12 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      )
    }
    return (
      <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold">
          {(otherMember?.name || group.name || "?").charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-2 md:gap-6">
      {/* Sidebar - Lista conversații */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-slate-800 rounded-2xl border border-slate-700 flex-col ${selectedGroup && !showSidebar ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Mesaje</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Conversație nouă"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              {currentAdmin?.role === "super_admin" && (
                <button
                  onClick={() => setShowNewGroup(true)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Grup nou"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista grupuri și conversații - separate */}
        <div className="flex-1 overflow-y-auto">
          {/* Grupuri (general + grupuri create) */}
          {groups.filter(g => g.type === "general" || g.type === "group").length > 0 && (
            <div className="border-b border-slate-600">
              <div className="px-3 py-2 bg-slate-700/30">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupuri</span>
              </div>
              {groups.filter(g => g.type === "general" || g.type === "group").map((group) => (
                <div
                  key={group.id}
                  onClick={() => { setSelectedGroup(group); setShowSidebar(false); }}
                  className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-b border-slate-700/50 ${
                    selectedGroup?.id === group.id 
                      ? "bg-slate-700/50" 
                      : "hover:bg-slate-700/30"
                  }`}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                    {getGroupIcon(group)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm md:text-base">
                      {group.name || "Conversație"}
                    </p>
                    {group.lastMessage && (
                      <p className="text-slate-400 text-xs md:text-sm truncate">
                        {group.lastMessage.hasImage && !group.lastMessage.content ? "📷 Imagine" : group.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {group.lastMessage && (
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {formatTime(group.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Conversații private */}
          {groups.filter(g => g.type === "individual").length > 0 && (
            <div>
              <div className="px-3 py-2 bg-slate-700/30">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversații private</span>
              </div>
              {groups.filter(g => g.type === "individual").map((group) => (
                <div
                  key={group.id}
                  onClick={() => { setSelectedGroup(group); setShowSidebar(false); }}
                  className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-b border-slate-700/50 ${
                    selectedGroup?.id === group.id 
                      ? "bg-slate-700/50" 
                      : "hover:bg-slate-700/30"
                  }`}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                    {getGroupIcon(group)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm md:text-base">
                      {group.name || "Conversație"}
                    </p>
                    {group.lastMessage && (
                      <p className="text-slate-400 text-xs md:text-sm truncate">
                        {group.lastMessage.hasImage && !group.lastMessage.content ? "📷 Imagine" : group.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {group.lastMessage && (
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {formatTime(group.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!showSidebar || !selectedGroup ? 'flex' : 'hidden'} md:flex flex-1 bg-slate-800 rounded-2xl border border-slate-700 flex-col min-h-0`}>
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Buton înapoi pentru mobil */}
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                  {getGroupIcon(selectedGroup)}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">{selectedGroup.name}</h3>
                  <p className="text-slate-400 text-xs md:text-sm">
                    {selectedGroup.type === "general" 
                      ? "Toți adminii" 
                      : selectedGroup.type === "group"
                        ? `${selectedGroup.members?.length || 0} membri`
                        : "Conversație privată"}
                  </p>
                </div>
              </div>
              {currentAdmin?.role === "super_admin" && selectedGroup.type === "group" && (
                <button
                  onClick={openGroupSettings}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 relative"
            >
              {messages.map((message) => {
                const isOwn = message.sender?.id === currentAdmin?.id
                const canEdit = isOwn && !message.isDeleted && (new Date() - new Date(message.createdAt)) < 5 * 60 * 1000
                
                return (
                  <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                      {!isOwn && (
                        message.sender?.image ? (
                          <img 
                            src={message.sender.image} 
                            alt={message.sender.name}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {(message.sender?.name || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )
                      )}
                      
                      <div className="group">
                        {!isOwn && selectedGroup.type !== "individual" && (
                          <p className="text-xs text-slate-400 mb-1 ml-1">
                            {message.sender?.name || message.sender?.email}
                          </p>
                        )}
                        
                        <div 
                          className={`relative rounded-2xl px-4 py-2 select-none ${
                            message.isDeleted 
                              ? "bg-slate-700/50 italic text-slate-500"
                              : isOwn 
                                ? "bg-amber-500 text-white" 
                                : "bg-slate-700 text-white"
                          } ${canEdit ? 'cursor-pointer' : ''}`}
                          onTouchStart={(e) => handleTouchStart(e, message, isOwn)}
                          onTouchEnd={handleTouchEnd}
                          onTouchMove={handleTouchMove}
                        >
                          {message.isDeleted ? (
                            <span className="text-sm">Mesaj șters</span>
                          ) : (
                            <>
                              {message.image && (
                                <img 
                                  src={message.image} 
                                  alt="Imagine" 
                                  className="max-w-full rounded-lg mb-2 cursor-pointer"
                                  onClick={() => window.open(message.image, "_blank")}
                                />
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              {message.isEdited && !message.isDeleted && (
                                <span className="text-xs opacity-60 ml-2">(editat)</span>
                              )}
                            </>
                          )}
                          
                          {/* Actions menu desktop - doar în primele 5 minute */}
                          {canEdit && editingMessage !== message.id && (
                            <div className="absolute -top-8 right-0 hidden md:group-hover:flex gap-1 bg-slate-900 rounded-lg p-1">
                              <button
                                onClick={() => startEditing(message.id, message.content)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                title="Editează (disponibil 5 min)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                                title="Șterge (disponibil 5 min)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <p className={`text-xs text-slate-500 mt-1 ${isOwn ? "text-right" : ""}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
              
              {/* Buton scroll la ultimul mesaj */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-28 right-4 md:right-auto md:absolute md:bottom-4 md:right-4 z-40 w-10 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  title="Mergi la ultimul mesaj"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Long press context menu pentru mobil */}
            {longPressMenu && (
              <>
                <div 
                  className="fixed inset-0 z-50 bg-black/30 md:hidden"
                  onTouchEnd={(e) => {
                    // Previne închiderea imediată după long press
                    const timeSinceOpen = Date.now() - (menuOpenTimeRef.current || 0)
                    if (timeSinceOpen > 300) {
                      setLongPressMenu(null)
                    }
                  }}
                  onClick={(e) => {
                    // Previne închiderea imediată
                    const timeSinceOpen = Date.now() - (menuOpenTimeRef.current || 0)
                    if (timeSinceOpen > 300) {
                      setLongPressMenu(null)
                    }
                  }}
                />
                <div 
                  className="fixed z-50 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden md:hidden"
                  style={{
                    left: Math.min(longPressMenu.x, window.innerWidth - 150),
                    top: Math.max(longPressMenu.y - 100, 10)
                  }}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => startEditing(longPressMenu.messageId, longPressMenu.content)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editează
                  </button>
                  <button
                    onClick={() => handleMobileDelete(longPressMenu.messageId)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 transition-colors border-t border-slate-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Șterge
                  </button>
                </div>
              </>
            )}

            {/* Message Input */}
            <div className="p-3 md:p-4 border-t border-slate-700">
              {/* Indicator editare */}
              {editingMessage && (
                <div className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 mb-2 border-l-2 border-amber-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm text-slate-300">Editare mesaj</span>
                  </div>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {imagePreview && (
                <div className="relative inline-block mb-2">
                  <img src={imagePreview} alt="Preview" className="h-16 md:h-20 rounded-lg" />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                {!editingMessage && (
                  <>
                    {/* Buton cameră - vizibil pe mobil */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-2.5 md:p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors flex-shrink-0 md:hidden"
                      disabled={uploading}
                      title="Fă o poză"
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {/* Buton galerie */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 md:p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors flex-shrink-0"
                      disabled={uploading}
                      title="Alege o imagine"
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={editingMessage ? "Editează mesajul..." : "Scrie un mesaj..."}
                  className={`flex-1 min-w-0 bg-slate-700 border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-white text-sm md:text-base placeholder-slate-400 focus:ring-2 focus:border-transparent ${
                    editingMessage 
                      ? 'border-amber-500 focus:ring-amber-500' 
                      : 'border-slate-600 focus:ring-amber-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !selectedImage && !editingMessage || sending}
                  className={`px-4 md:px-6 py-2.5 md:py-3 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${
                    editingMessage 
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  }`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : editingMessage ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex-col items-center justify-center text-slate-400 ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
            <svg className="w-12 h-12 md:w-16 md:h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-base md:text-lg">Selectează o conversație</p>
            <p className="text-xs md:text-sm">sau începe una nouă</p>
          </div>
        )}
      </div>

      {/* Modal - Conversație nouă */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Conversație nouă</h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => handleStartChat(admin.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl transition-colors text-left"
                >
                  {admin.image ? (
                    <img 
                      src={admin.image} 
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(admin.name || admin.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{admin.name || "Fără nume"}</p>
                    <p className="text-slate-400 text-sm">{admin.email}</p>
                  </div>
                </button>
              ))}
              {admins.length === 0 && (
                <p className="text-center text-slate-400 py-4">Nu există alți admini</p>
              )}
            </div>
            
            <button
              onClick={() => setShowNewChat(false)}
              className="w-full mt-4 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {/* Modal - Grup nou (doar super admin) */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Creează grup nou</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Iconița grupului */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {newGroupImagePreview ? (
                    <img 
                      src={newGroupImagePreview} 
                      alt="Iconița grupului"
                      className="w-20 h-20 rounded-full object-cover border-4 border-slate-600"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-slate-600">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => newGroupImageInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-amber-500 hover:bg-amber-600 rounded-full text-white shadow-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={newGroupImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleNewGroupImageSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-2">Adaugă iconița grupului (opțional)</p>
              </div>
              
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Numele grupului"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500"
              />
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Selectează membri:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {admins.map((admin) => (
                    <label
                      key={admin.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(admin.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, admin.id])
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== admin.id))
                          }
                        }}
                        className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-amber-500 focus:ring-amber-500"
                      />
                      {admin.image ? (
                        <img 
                          src={admin.image} 
                          alt={admin.name}
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(admin.name || admin.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{admin.name || "Fără nume"}</p>
                        <p className="text-slate-400 text-sm">{admin.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => { 
                  setShowNewGroup(false)
                  setGroupName("")
                  setSelectedMembers([])
                  setNewGroupImage(null)
                  setNewGroupImagePreview(null)
                }}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedMembers.length === 0 || creatingGroup}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {creatingGroup ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                    Se creează...
                  </>
                ) : (
                  "Creează"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Setări grup */}
      {showGroupSettings && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Setări grup</h3>
                <button
                  onClick={() => setShowGroupSettings(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* Iconița grupului */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {editGroupImagePreview ? (
                    <img 
                      src={editGroupImagePreview} 
                      alt="Iconița grupului"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-600"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-slate-600">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => groupImageInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-600 rounded-full text-white shadow-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={groupImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGroupImageSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-slate-400 text-sm mt-2">Apasă pentru a schimba iconița</p>
              </div>

              {/* Numele grupului */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Nume grup</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Nume grup"
                />
              </div>

              {/* Membri actuali */}
              <div>
                <p className="text-slate-400 text-sm mb-2">Membri ({selectedGroup.members?.length || 0})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedGroup.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {(member.name || member.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-white text-sm">{member.name || member.email}</span>
                          {member.role === "super_admin" && (
                            <span className="ml-2 text-xs text-amber-400">(Super Admin)</span>
                          )}
                          {member.id === currentAdmin?.id && (
                            <span className="ml-2 text-xs text-slate-400">(tu)</span>
                          )}
                        </div>
                      </div>
                      {member.role !== "super_admin" && member.id !== currentAdmin?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Elimină din grup"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adaugă membri noi */}
              {admins.filter(a => !selectedGroup.members?.find(m => m.id === a.id)).length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Adaugă membri</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {admins.filter(a => !selectedGroup.members?.find(m => m.id === a.id)).map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {admin.image ? (
                            <img 
                              src={admin.image} 
                              alt={admin.name}
                              className="w-8 h-8 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {(admin.name || admin.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-white text-sm">{admin.name || admin.email}</span>
                        </div>
                        <button
                          onClick={() => handleAddMember(admin.id)}
                          className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Adaugă în grup"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={handleSaveGroupSettings}
                disabled={savingGroup}
                className="flex-1 px-4 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingGroup ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                    Se salvează...
                  </>
                ) : (
                  "Salvează modificările"
                )}
              </button>
              <button
                onClick={() => handleDeleteGroup(selectedGroup.id)}
                className="px-4 py-3 bg-red-500/10 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmare */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700 p-6">
            {confirmModal.type === 'removeMember' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white text-center mb-2">Elimină membru</h3>
                <p className="text-slate-400 text-center mb-6">
                  Sigur vrei să elimini pe <span className="text-white font-medium">{confirmModal.data.memberName}</span> din grup?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={confirmRemoveMember}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Elimină
                  </button>
                </div>
              </>
            )}

            {confirmModal.type === 'deleteGroup' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white text-center mb-2">Șterge grupul</h3>
                <p className="text-slate-400 text-center mb-6">
                  Sigur vrei să ștergi acest grup? Toate mesajele vor fi șterse permanent.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={confirmDeleteGroup}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Șterge
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
