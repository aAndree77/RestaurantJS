"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

// Hook pentru animația de numărare
function useCountUp(end, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!startCounting) return

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / duration, 1)
      
      // Easing function pentru efect mai natural
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4)
      const currentCount = Math.floor(easeOutQuart * end)
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount
        setCount(currentCount)
      }

      if (percentage < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, startCounting])

  return count
}

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  const [startCounting, setStartCounting] = useState(false)

  const yearsCount = useCountUp(15, 2000, startCounting)
  const dishesCount = useCountUp(50, 2200, startCounting)
  const clientsCount = useCountUp(10, 2500, startCounting)

  useEffect(() => {
    setLoaded(true)
    // Start counting after initial animations
    const timer = setTimeout(() => {
      setStartCounting(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] bg-cover bg-center"
        style={{ opacity: 0.4 }}
      ></div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-stone-950/50"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]"></div>
      
      {/* Animated decorative lines */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent transition-all duration-1000 ease-out ${loaded ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}></div>
      
      {/* Left decorative lines */}
      <div className="absolute left-8 top-1/3 hidden lg:flex flex-col gap-4">
        <div className={`w-px bg-gradient-to-b from-amber-500/40 to-transparent transition-all duration-700 delay-300 ${loaded ? 'h-24 opacity-100' : 'h-0 opacity-0'}`}></div>
        <div className={`w-2 h-2 rounded-full border border-amber-500/40 transition-all duration-500 delay-500 ${loaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`w-px bg-gradient-to-b from-amber-500/30 to-transparent transition-all duration-700 delay-700 ${loaded ? 'h-16 opacity-100' : 'h-0 opacity-0'}`}></div>
      </div>
      
      {/* Right decorative lines */}
      <div className="absolute right-8 top-1/3 hidden lg:flex flex-col items-center gap-4">
        <div className={`w-px bg-gradient-to-b from-amber-500/40 to-transparent transition-all duration-700 delay-400 ${loaded ? 'h-20 opacity-100' : 'h-0 opacity-0'}`}></div>
        <div className={`w-3 h-3 rounded-full bg-amber-500/20 transition-all duration-500 delay-600 ${loaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`w-px bg-gradient-to-b from-amber-500/20 to-transparent transition-all duration-700 delay-800 ${loaded ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}></div>
      </div>

      {/* Horizontal animated lines */}
      <div className={`absolute top-1/4 left-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transition-all duration-1000 delay-200 ${loaded ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}></div>
      <div className={`absolute top-1/3 right-0 h-px bg-gradient-to-l from-transparent via-amber-500/20 to-transparent transition-all duration-1000 delay-400 ${loaded ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}></div>
      <div className={`absolute bottom-1/3 left-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent transition-all duration-1000 delay-600 ${loaded ? 'w-40 opacity-100' : 'w-0 opacity-0'}`}></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className={`mb-8 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-md border border-amber-500/20 rounded-full">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-1 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-0.5 h-0.5 bg-amber-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <span className="text-amber-200/90 text-sm font-medium tracking-wider uppercase">Autenticitate Italiană din 2010</span>
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className={`mb-6 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-white/90 tracking-wide mb-2">
              Bun venit la
            </span>
            <span className="block text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                La Bella Italia
              </span>
            </span>
          </h1>
          
          {/* Decorative divider */}
          <div className={`flex items-center gap-4 my-8 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className={`h-px bg-gradient-to-r from-transparent to-amber-500/50 transition-all duration-700 delay-300 ${loaded ? 'w-16' : 'w-0'}`}></div>
            <svg className="w-8 h-8 text-amber-400/70" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 14 6 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6 12 2 12 2Z" fill="currentColor"/>
              <path d="M12 10V14M8 18H16M9 22H15M12 14C8 14 5 16 5 18C5 20 8 22 12 22C16 22 19 20 19 18C19 16 16 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className={`h-px bg-gradient-to-l from-transparent to-amber-500/50 transition-all duration-700 delay-300 ${loaded ? 'w-16' : 'w-0'}`}></div>
          </div>
          
          {/* Subtitle */}
          <p className={`text-lg md:text-xl text-stone-300/90 max-w-2xl leading-relaxed mb-12 transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Descoperă aromele autentice ale Italiei într-o atmosferă caldă și primitoare. 
            Preparate tradiționale pregătite cu pasiune și ingrediente de cea mai bună calitate.
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-20 transition-all duration-700 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/menu"
              className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 text-lg font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center justify-center gap-3">
                {/* Menu/Book icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 7h8M8 11h6" strokeLinecap="round"/>
                </svg>
                Vezi Meniul
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            
            <Link
              href="/#contact"
              className="group px-10 py-4 bg-white/5 backdrop-blur-md text-white text-lg font-semibold rounded-full border border-white/20 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-500 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-3">
                {/* Table/Reservation icon */}
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="3"/>
                  <path d="M12 11v6"/>
                  <path d="M6 21h12"/>
                  <path d="M6 21v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>
                </svg>
                Rezervă o Masă
              </span>
            </Link>
          </div>
          
          {/* Stats */}
          <div className={`grid grid-cols-3 gap-6 md:gap-12 w-full max-w-2xl transition-all duration-700 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {[
              { value: yearsCount, suffix: "+", label: "Ani de Excelență", icon: (
                <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { value: dishesCount, suffix: "+", label: "Preparate Unice", icon: (
                <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 12C12 12 8 8 8 5C8 3 9.5 2 12 2C14.5 2 16 3 16 5C16 8 12 12 12 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12V16"/>
                  <path d="M8 20H16"/>
                  <path d="M9 16H15V20H9V16Z"/>
                </svg>
              )},
              { value: clientsCount, suffix: "K+", label: "Clienți Fericiți", icon: (
                <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
            ].map((stat, index) => (
              <div key={index} className="group text-center">
                <div className="flex justify-center mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tabular-nums">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs md:text-sm text-stone-400 mt-2 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corner decorative elements */}
      <div className={`absolute bottom-20 left-12 hidden lg:block transition-all duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-amber-500/30"></div>
          <div className="w-2 h-2 rotate-45 border border-amber-500/30"></div>
        </div>
      </div>
      
      <div className={`absolute bottom-20 right-12 hidden lg:block transition-all duration-1000 delay-800 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rotate-45 border border-amber-500/30"></div>
          <div className="w-8 h-px bg-amber-500/30"></div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none"></div>
    </section>
  )
}
