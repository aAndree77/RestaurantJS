"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import CartButton from "./CartButton"

export default function Navbar({ solid = false }) {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Verifică dacă utilizatorul e admin
  useEffect(() => {
    if (session?.user?.email) {
      checkAdmin()
    } else {
      setIsAdmin(false)
    }
  }, [session?.user?.email])

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/admin/check")
      const data = await res.json()
      setIsAdmin(data.isAdmin === true)
    } catch {
      setIsAdmin(false)
    }
  }

  // Dacă solid e true, navbar-ul e mereu alb
  const isScrolled = solid || scrolled

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop" 
                  alt="La Bella Italia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-serif font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-amber-800' : 'text-white'
                }`}>
                  La Bella Italia
                </span>
                <span className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-gray-500' : 'text-amber-200'
                }`}>
                  Ristorante
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: "/", label: "Acasă" },
              { href: "/menu", label: "Meniu" },
              { href: "/#about", label: "Despre Noi" },
              { href: "/#testimonials", label: "Recenzii" },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                  isScrolled ? 'text-gray-700 hover:text-amber-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-amber-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Button */}
            <div className={`transition-colors ${isScrolled ? '' : '[&_svg]:stroke-white'}`}>
              <CartButton />
            </div>
            
            {status === "loading" ? (
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {/* Buton Admin - vizibil doar pentru admini */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "Profile"} 
                      className="w-10 h-10 rounded-full border-2 border-amber-500 shadow-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-amber-500 shadow-lg">
                      {(session.user?.name || session.user?.email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <Link
                  href="/orders"
                  className={`px-3 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${
                    isScrolled 
                      ? 'text-amber-600 hover:bg-amber-50' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </Link>
                <button
                  onClick={() => signOut()}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-amber-600 border border-amber-600 hover:bg-amber-50' 
                      : 'text-white border border-white/50 hover:bg-white/10'
                  }`}
                >
                  Deconectare
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-amber-600' 
                      : 'text-white hover:text-amber-200'
                  }`}
                >
                  Conectare
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
                >
                  Înregistrare
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className={`transition-colors ${isScrolled ? '' : '[&_svg]:stroke-white'}`}>
              <CartButton />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`pb-4 space-y-1 ${isScrolled ? '' : 'bg-black/20 backdrop-blur-md rounded-xl mt-2 p-4'}`}>
            {[
              { href: "/", label: "Acasă" },
              { href: "/menu", label: "Meniu" },
              { href: "/#about", label: "Despre Noi" },
              { href: "/#testimonials", label: "Recenzii" },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-amber-50 hover:text-amber-600' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className={`pt-4 mt-4 border-t ${isScrolled ? 'border-gray-200' : 'border-white/20'} flex flex-col space-y-2`}>
              {session ? (
                <>
                  <div className="flex items-center space-x-2 px-4 py-2">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "Profile"} 
                        className="w-10 h-10 rounded-full border-2 border-amber-500 shadow-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-amber-500 shadow-lg">
                        {(session.user?.name || session.user?.email)?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={isScrolled ? 'text-gray-700' : 'text-white'}>
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                  </div>
                  {/* Buton Admin în meniu mobil */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium text-center transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Panou Admin
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mx-4 py-2 rounded-full font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                      isScrolled 
                        ? 'text-amber-600 border border-amber-200 hover:bg-amber-50' 
                        : 'text-white border border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Comenzile Mele
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className={`mx-4 py-2 rounded-full font-medium text-center transition-colors ${
                      isScrolled 
                        ? 'text-amber-600 border border-amber-600 hover:bg-amber-50' 
                        : 'text-white border border-white/50 hover:bg-white/10'
                    }`}
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mx-4 py-2 rounded-full font-medium text-center transition-colors ${
                      isScrolled 
                        ? 'text-amber-600 border border-amber-600 hover:bg-amber-50' 
                        : 'text-white border border-white/50 hover:bg-white/10'
                    }`}
                  >
                    Conectare
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mx-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium text-center hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    Înregistrare
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
