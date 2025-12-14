'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({ years: 0, dishes: 0, clients: 0, stars: 0 })
  const sectionRef = useRef(null)

  const stats = [
    { value: 15, suffix: "+", label: "Ani de Excelență", key: "years", icon: "trophy", color: "from-amber-400 to-yellow-500" },
    { value: 50, suffix: "+", label: "Preparate Unice", key: "dishes", icon: "utensils", color: "from-orange-400 to-red-500" },
    { value: 10, suffix: "K+", label: "Clienți Fericiți", key: "clients", icon: "heart", color: "from-pink-400 to-rose-500" },
    { value: 5, suffix: "", label: "Stele Michelin", key: "stars", icon: "star", color: "from-emerald-400 to-teal-500" }
  ]

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2, rootMargin: '-50px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animated counters
  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setCounters({
        years: Math.floor(15 * easeOut),
        dishes: Math.floor(50 * easeOut),
        clients: Math.floor(10 * easeOut),
        stars: Math.floor(5 * easeOut)
      })

      if (currentStep >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  const timelineItems = [
    { year: "2010", title: "Începutul", desc: "Deschiderea primului restaurant în inima Bucureștiului" },
    { year: "2015", title: "Prima Stea Michelin", desc: "Recunoaștere internațională pentru excelență culinară" },
    { year: "2020", title: "Expansiune", desc: "Deschiderea locației flagship cu terasă panoramică" },
    { year: "2024", title: "Inovație", desc: "Lansarea platformei de comenzi online cu livrare premium" }
  ]

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="py-32 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-amber-900/5 via-transparent to-transparent rounded-full"></div>
        
        {/* Floating particles - using deterministic positions */}
        {[
          { left: 5, top: 10, delay: 0, duration: 8 },
          { left: 15, top: 80, delay: 1, duration: 9 },
          { left: 25, top: 30, delay: 2, duration: 10 },
          { left: 35, top: 60, delay: 3, duration: 11 },
          { left: 45, top: 20, delay: 4, duration: 8.5 },
          { left: 55, top: 70, delay: 0.5, duration: 9.5 },
          { left: 65, top: 40, delay: 1.5, duration: 10.5 },
          { left: 75, top: 90, delay: 2.5, duration: 11.5 },
          { left: 85, top: 15, delay: 3.5, duration: 8.2 },
          { left: 95, top: 55, delay: 4.5, duration: 9.2 },
          { left: 10, top: 45, delay: 0.3, duration: 10.2 },
          { left: 20, top: 85, delay: 1.3, duration: 11.2 },
          { left: 30, top: 25, delay: 2.3, duration: 8.7 },
          { left: 40, top: 65, delay: 3.3, duration: 9.7 },
          { left: 50, top: 5, delay: 4.3, duration: 10.7 },
          { left: 60, top: 75, delay: 0.7, duration: 11.7 },
          { left: 70, top: 35, delay: 1.7, duration: 8.4 },
          { left: 80, top: 95, delay: 2.7, duration: 9.4 },
          { left: 90, top: 50, delay: 3.7, duration: 10.4 },
          { left: 3, top: 68, delay: 4.7, duration: 11.4 }
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="text-amber-400 text-sm font-medium tracking-wider uppercase">Povestea Noastră</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">
            <span className="block text-white">O Tradiție de</span>
            <span className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 animate-gradient-x">
                Excelență Culinară
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-6">
            Din 2010, aducem aromele autentice ale Italiei în inima Bucureștiului
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Story Content */}
          <div className={`lg:col-span-7 transition-all duration-1000 delay-200 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Story Text */}
            <div className="relative">
              <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-amber-500 via-orange-500 to-transparent rounded-full"></div>
              
              <div className="space-y-6 text-gray-300 leading-relaxed pl-6">
                <p className="text-xl lg:text-2xl font-light text-white/90">
                  <span className="text-amber-400 font-semibold">La Bella Italia</span> s-a născut din pasiunea pentru bucătăria italiană autentică și dorința de a crea experiențe culinare memorabile.
                </p>
                
                <p className="text-lg">
                  Fondatorul nostru, <span className="text-white font-medium">Chef Marco Rossi</span>, a adus cu el secretele culinare moștenite din generație în generație din regiunea Toscana. Fiecare rețetă poartă amprenta tradiției și inovației.
                </p>
                
                <p>
                  Folosim doar ingrediente proaspete, selectate cu grijă de la producători locali și importatori de încredere din Italia. Pastele noastre sunt făcute în casă, zilnic, iar sosurile sunt preparate după rețete transmise de generații.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-16">
              <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Călătoria Noastră
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500/50 via-orange-500/50 to-transparent"></div>
                
                <div className="space-y-6">
                  {timelineItems.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex gap-6 group transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
                      style={{ transitionDelay: `${400 + index * 150}ms` }}
                    >
                      {/* Dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-stone-800 border-2 border-amber-500/50 rounded-full flex items-center justify-center group-hover:border-amber-400 group-hover:bg-amber-500/20 transition-all duration-500 ease-out">
                          <div className="w-3 h-3 bg-amber-500 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out"></div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 group-hover:border-amber-500/30 group-hover:bg-white/[0.07] transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-lg">
                            {item.year}
                          </span>
                          <h4 className="font-semibold text-white">{item.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chef Card & Stats */}
          <div className={`lg:col-span-5 space-y-8 transition-all duration-1000 delay-400 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Chef Card */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-stone-800/80 to-stone-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                {/* Italian flag accent */}
                <div className="absolute top-0 right-8 w-20 h-1.5 rounded-b-full overflow-hidden flex">
                  <div className="flex-1 bg-green-500"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-red-500"></div>
                </div>
                
                <div className="relative text-center py-6">
                  {/* Chef image container */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-full blur-2xl scale-125 animate-pulse-slow"></div>
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-amber-500/30 transition-all duration-500 ease-out group-hover:border-amber-400">
                      <Image
                        src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop&crop=face"
                        alt="Chef Marco Rossi"
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>
                    {/* Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
                      Executive Chef
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-white">Marco Rossi</h3>
                  <p className="text-amber-400 font-medium mt-1">Fondator & Visionar Culinar</p>
                  
                  {/* Credentials */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {[
                      { icon: "location", text: "Toscana" },
                      { icon: "education", text: "Le Cordon Bleu" },
                      { icon: "star", text: "20+ Ani Experiență" }
                    ].map((item, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 border border-white/10 transition-colors duration-300"
                      >
                        {item.icon === "location" && (
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {item.icon === "education" && (
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        )}
                        {item.icon === "star" && (
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        )}
                        <span>{item.text}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative mt-6 pt-6 border-t border-white/10">
                  <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-500/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-gray-300 text-center italic font-serif text-lg leading-relaxed">
                    "La bucătărie, dragostea este ingredientul secret care transformă mâncarea în artă."
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`group relative overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                  
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 group-hover:border-amber-500/40 transition-all duration-700 ease-out text-center">
                    {/* Icon */}
                    <div className="mb-3 flex justify-center transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                      {stat.icon === "trophy" && (
                        <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      )}
                      {stat.icon === "utensils" && (
                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {stat.icon === "heart" && (
                        <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      )}
                      {stat.icon === "star" && (
                        <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )}
                    </div>
                    
                    {/* Counter */}
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                      {counters[stat.key]}{stat.suffix}
                    </div>
                    
                    {/* Label */}
                    <div className="text-xs text-gray-400 mt-2 font-medium tracking-wide uppercase">
                      {stat.label}
                    </div>
                    
                    {/* Decorative line */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${stat.color} group-hover:w-1/2 transition-all duration-500`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <a 
              href="/#about" 
              className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <span className="relative">Descoperă Povestea Completă</span>
              <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
