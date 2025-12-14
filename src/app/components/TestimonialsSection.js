"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [testimonials.length])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials")
      const data = await res.json()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback testimonials if no data
  const fallbackTestimonials = [
    {
      id: "1",
      name: "Maria Ionescu",
      role: "Food Blogger",
      content: "Cea mai bună pizza din București! Atmosfera este minunată, iar personalul foarte amabil. O experiență culinară pe care o recomand cu căldură tuturor!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
    },
    {
      id: "2",
      name: "Alexandru Popa",
      role: "Client Fidel",
      content: "Paste carbonara perfecte! Exact ca în Italia. Am revenit de nenumărate ori și nu am fost niciodată dezamăgit. Locul meu preferat din București.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      id: "3",
      name: "Elena Dumitrescu",
      role: "Event Planner",
      content: "Locul perfect pentru o seară romantică. Tiramisu-ul este absolut divin! Am organizat aici mai multe evenimente și totul a fost impecabil.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
    }
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials

  return (
    <section className="py-32 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-400 text-sm font-medium">Recenzii Verificate</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            Ce Spun <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Clienții</span> Noștri
          </h2>
          
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Peste 10,000 de clienți fericiți ne-au încredințat momentele lor speciale.
            Descoperă poveștile lor.
          </p>
        </div>

        {/* Main testimonial display */}
        {!loading && displayTestimonials.length > 0 && (
          <div className="relative">
            {/* Featured testimonial card */}
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-stone-800/80 to-stone-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-stone-700/50 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 rotate-12">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-lg opacity-50"></div>
                      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-amber-500/20">
                        {displayTestimonials[activeIndex]?.image ? (
                          <Image
                            src={displayTestimonials[activeIndex].image}
                            alt={displayTestimonials[activeIndex].name}
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl text-white">
                            {displayTestimonials[activeIndex]?.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Rating */}
                    <div className="flex gap-1 justify-center md:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < (displayTestimonials[activeIndex]?.rating || 5) ? 'text-amber-400' : 'text-stone-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-6">
                      "{displayTestimonials[activeIndex]?.content}"
                    </blockquote>

                    {/* Author */}
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {displayTestimonials[activeIndex]?.name}
                      </p>
                      <p className="text-amber-400">
                        {displayTestimonials[activeIndex]?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation dots */}
                {displayTestimonials.length > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {displayTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === activeIndex 
                            ? 'w-8 h-2 bg-gradient-to-r from-amber-400 to-orange-500' 
                            : 'w-2 h-2 bg-stone-600 hover:bg-stone-500'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial thumbnails */}
            {displayTestimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                {displayTestimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    onClick={() => setActiveIndex(index)}
                    className={`relative group transition-all duration-300 ${
                      index === activeIndex ? 'scale-110' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                      index === activeIndex 
                        ? 'ring-amber-500 ring-offset-2 ring-offset-stone-900' 
                        : 'ring-stone-600 group-hover:ring-stone-500'
                    }`}>
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg text-white">
                          {testimonial.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-amber-400/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
