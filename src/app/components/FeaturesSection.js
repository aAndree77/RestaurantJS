"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    if (modalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen])

  const openModal = (feature) => {
    setSelectedFeature(feature)
    setModalOpen(true)
  }

  const features = [
    {
      image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop",
      title: "Ingrediente Proaspete",
      description: "Ingrediente premium importate săptămânal din cele mai bune regiuni ale Italiei.",
      longDescription: "Colaborăm direct cu ferme din Toscana, Emilia-Romagna și Sicilia pentru a aduce cele mai proaspete ingrediente. De la roșiile San Marzano la mozzarella di bufala, fiecare ingredient este selectat cu grijă.",
      details: [
        "Roșii San Marzano DOP importate din Napoli",
        "Mozzarella di Bufala proaspătă săptămânal",
        "Ulei de măsline extra virgin din Toscana",
        "Paste făcute zilnic în bucătăria noastră",
        "Brânzeturi maturate în pivnițe italiene"
      ],
      gradient: "from-emerald-400 to-green-500"
    },
    {
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=600&fit=crop",
      title: "Bucătari Experți",
      description: "Echipa noastră a fost instruită în cele mai prestigioase restaurante din Roma și Milano.",
      longDescription: "Chef-ul nostru executiv Marco Rossi a lucrat în restaurante cu stele Michelin din Italia. Fiecare membru al echipei aduce ani de experiență și pasiune pentru bucătăria italiană autentică.",
      details: [
        "Chef Marco Rossi - 20+ ani experiență",
        "Formare în restaurante cu stele Michelin",
        "Echipă de 8 bucătari specializați",
        "Rețete tradiționale transmise din generație în generație",
        "Tehnici culinare italiene autentice"
      ],
      gradient: "from-amber-400 to-orange-500"
    },
    {
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
      title: "Vinuri Selecte",
      description: "Colecție exclusivă de vinuri din Toscana, Piemonte și regiuni renumite ale Italiei.",
      longDescription: "Crama noastră include peste 150 de etichete selectate personal de sommelierul nostru. De la Chianti Classico la Barolo, găsești perechea perfectă pentru fiecare preparat.",
      details: [
        "Peste 150 de etichete de vinuri italiene",
        "Chianti Classico DOCG din Toscana",
        "Barolo și Barbaresco din Piemonte",
        "Prosecco și Franciacorta pentru sărbători",
        "Sommelier dedicat pentru recomandări"
      ],
      gradient: "from-rose-400 to-red-500"
    },
    {
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      title: "Atmosferă Unică",
      description: "Un ambient romantic și autentic italian, perfect pentru momente speciale.",
      longDescription: "Interiorul nostru a fost conceput de designeri italieni, aducând căldura și eleganța peninsulei direct în București. Lumini ambientale, muzică live și decoruri autentice te transportă în inima Italiei.",
      details: [
        "Design interior creat de arhitecți italieni",
        "Muzică live în weekend",
        "Terasă cu vedere panoramică",
        "Spațiu privat pentru evenimente",
        "Iluminat ambiental romantic"
      ],
      gradient: "from-pink-400 to-rose-500"
    }
  ]

  return (
    <>
      <section className="py-24 bg-gradient-to-b from-white via-stone-50 to-white relative overflow-hidden">
        {/* Modern geometric background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-50/30 to-orange-50/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Modern section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-200/50 rounded-full mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-amber-700 font-medium text-sm tracking-wide">Experiența La Bella Italia</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6">
              De Ce Să Ne <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Alegi</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-1 bg-gradient-to-r from-transparent to-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div className="w-12 h-1 bg-gradient-to-l from-transparent to-amber-400 rounded-full"></div>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Oferim o experiență culinară autentică, unde tradiția italiană 
              se împletește cu pasiunea pentru excelență.
            </p>
          </div>

          {/* Modern features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-amber-200 transition-all duration-500 ease-out"
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image container */}
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 transition-opacity duration-500 ease-out group-hover:opacity-30`}></div>
                    
                    {/* Floating badge */}
                    <div className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ease-out group-hover:scale-110`}>
                      <span className="text-white font-bold text-lg">0{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 transition-colors duration-500 ease-out group-hover:text-amber-600">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Modern CTA button */}
                    <button 
                      onClick={() => openModal(feature)}
                      className="inline-flex items-center gap-2 text-amber-600 font-semibold group/btn transition-all duration-500 ease-out hover:gap-3"
                    >
                      <span>Află mai multe</span>
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover/btn:bg-amber-500 group-hover/btn:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.gradient} opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-10 rounded-bl-[100px]`}></div>
              </div>
            ))}
          </div>

          {/* Modern stats section */}
          

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link
                href="/menu"
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-700 ease-out shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Explorează Meniul</span>
                <svg className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-amber-400 hover:text-amber-600 transition-all duration-700 ease-out hover:scale-105"
              >
                Rezervă o Masă
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedFeature && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in"></div>
          
          {/* Modal content */}
          <div 
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-modal-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={selectedFeature.image}
                alt={selectedFeature.title}
                fill
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`}></div>
              
              {/* Close button */}
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className={`inline-block px-4 py-1 bg-gradient-to-r ${selectedFeature.gradient} rounded-full text-white text-sm font-medium mb-3`}>
                  La Bella Italia
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {selectedFeature.title}
                </h3>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[50vh]">
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {selectedFeature.longDescription}
              </p>
              
              {/* Details list */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Ce oferim:</h4>
                {selectedFeature.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-gradient-to-br ${selectedFeature.gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-600">{detail}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/menu"
                  onClick={() => setModalOpen(false)}
                  className={`flex-1 py-3 px-6 bg-gradient-to-r ${selectedFeature.gradient} text-white font-semibold rounded-xl text-center hover:opacity-90 transition-opacity duration-300`}
                >
                  Vezi Meniul
                </Link>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-500"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
