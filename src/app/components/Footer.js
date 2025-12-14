"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Footer() {
  const { data: session } = useSession()

  const quickLinks = [
    { href: "/", label: "Acasă" },
    { href: "/menu", label: "Meniu" },
    { href: "/#about", label: "Despre Noi" },
    { href: "/#testimonials", label: "Recenzii" },
  ]

  const legalLinks = [
    { href: "/privacy", label: "Politica de Confidențialitate" },
    { href: "/terms", label: "Termeni și Condiții" },
    { href: "/cookies", label: "Politica Cookies" },
  ]

  const contactInfo = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      text: "Strada Roma 123, București",
      href: "https://maps.google.com/?q=Strada+Roma+123+Bucuresti",
      target: "_blank"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      text: "+40 721 234 567",
      href: "tel:+40721234567",
      target: "_self"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: "contact@labellaitalia.ro",
      href: "mailto:contact@labellaitalia.ro",
      target: "_self"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Luni - Duminică: 12:00 - 23:00",
      href: null,
      target: null
    },
  ]

  const socialLinks = [
    {
      name: "Twitter / X",
      href: "https://twitter.com/labellaitalia_ro",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://instagram.com/labellaitalia_ro",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://facebook.com/labellaitalia.ro",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
        </svg>
      )
    },
    {
      name: "TripAdvisor",
      href: "https://tripadvisor.com/Restaurant_Review-La_Bella_Italia",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 004.04 10.432 5.976 5.976 0 004.075-1.6L12 19.5l1.922-1.886a5.976 5.976 0 004.075 1.6 5.997 5.997 0 004.04-10.432L24 6.648h-4.361a13.573 13.573 0 00-7.633-2.353zM12 6.818c1.693 0 3.385.384 4.933 1.147a5.969 5.969 0 00-4.933 4.072 5.969 5.969 0 00-4.933-4.072A11.072 11.072 0 0112 6.818zm-6.003 3.015a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm12.006 0a4.5 4.5 0 110 9 4.5 4.5 0 010-9zM5.997 11.34a2.997 2.997 0 100 5.994 2.997 2.997 0 000-5.994zm12.006 0a2.997 2.997 0 100 5.994 2.997 2.997 0 000-5.994zM5.997 12.842a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm12.006 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
        </svg>
      )
    },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Top Decorative Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop" 
                    alt="La Bella Italia"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                    La Bella Italia
                  </span>
                  <p className="text-xs text-gray-500 tracking-wider uppercase">Ristorante Italiano</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Aducem aromele autentice ale Italiei direct la masa ta. 
                Preparate tradiționale, ingrediente proaspete și o atmosferă caldă, încă din 1985.
              </p>
              
              {/* Newsletter */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-300 mb-3">Abonează-te la newsletter</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="email@exemplu.com" 
                    className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-r-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
                <span className="w-8 h-0.5 bg-gradient-to-r from-amber-500 to-transparent mr-3" />
                Link-uri Rapide
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-gray-400 hover:text-amber-400 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
                <span className="w-8 h-0.5 bg-gradient-to-r from-amber-500 to-transparent mr-3" />
                Legal
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-gray-400 hover:text-amber-400 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    </Link>
                  </li>
                ))}
                {!session && (
                  <li>
                    <Link 
                      href="/login" 
                      className="group inline-flex items-center mt-4 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg text-amber-400 hover:from-amber-500/20 hover:to-amber-600/20 transition-all duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Conectare
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
                <span className="w-8 h-0.5 bg-gradient-to-r from-amber-500 to-transparent mr-3" />
                Contact
              </h3>
              <ul className="space-y-4">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    {item.href ? (
                      <a 
                        href={item.href} 
                        target={item.target}
                        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="flex items-start space-x-3 group cursor-pointer"
                      >
                        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-amber-400 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all duration-300">
                          {item.icon}
                        </span>
                        <span className="text-gray-400 text-sm pt-2.5 group-hover:text-amber-400 transition-colors">
                          {item.text}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-start space-x-3 group">
                        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-amber-400">
                          {item.icon}
                        </span>
                        <span className="text-gray-400 text-sm pt-2.5">
                          {item.text}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>&copy; {new Date().getFullYear()} La Bella Italia.</span>
              <span className="hidden md:inline">|</span>
              <span>Toate drepturile rezervate.</span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center">
                Făcut cu 
                <svg className="w-4 h-4 mx-1 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                în România
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all duration-300 hover:-translate-y-1"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
    </footer>
  )
}
