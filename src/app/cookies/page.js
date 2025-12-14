"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function CookiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Înapoi la pagina principală
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Politica de <span className="text-amber-400">Cookies</span>
          </h1>
          <p className="text-stone-300">Ultima actualizare: 13 Decembrie 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg prose-stone max-w-none">
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">🍪</span>
              Ce sunt cookie-urile?
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                Cookie-urile sunt fișiere text mici care sunt plasate pe dispozitivul dumneavoastră (computer, telefon mobil sau tabletă) atunci când vizitați un site web. Acestea sunt utilizate pe scară largă pentru a face site-urile web să funcționeze mai eficient, precum și pentru a furniza informații proprietarilor site-ului.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">📋</span>
              Tipuri de cookie-uri utilizate
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Cookie-uri esențiale
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  Acestea sunt necesare pentru funcționarea site-ului web și nu pot fi dezactivate. Includ cookie-uri pentru autentificare, securitate și preferințele de sesiune.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Cookie-uri de performanță
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  Ne ajută să înțelegem cum utilizați site-ul nostru, colectând informații anonime despre paginile vizitate și erorile întâmpinate. Folosim aceste date pentru a îmbunătăți experiența utilizatorilor.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Cookie-uri funcționale
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  Permit site-ului să rețină preferințele dumneavoastră, precum limba preferată, regiunea sau detaliile de conectare, oferind o experiență personalizată.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                  Cookie-uri de marketing
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  Sunt utilizate pentru a afișa reclame relevante pentru interesele dumneavoastră. De asemenea, sunt folosite pentru a limita numărul de afișări ale unei reclame și pentru a măsura eficiența campaniilor publicitare.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">📊</span>
              Cookie-uri specifice utilizate
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 font-semibold text-stone-800">Nume</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-800">Furnizor</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-800">Scop</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-800">Expirare</th>
                  </tr>
                </thead>
                <tbody className="text-stone-600">
                  <tr className="border-b border-stone-100">
                    <td className="py-3 px-4">session_id</td>
                    <td className="py-3 px-4">La Bella Italia</td>
                    <td className="py-3 px-4">Menține sesiunea utilizatorului</td>
                    <td className="py-3 px-4">Sesiune</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 px-4">cart</td>
                    <td className="py-3 px-4">La Bella Italia</td>
                    <td className="py-3 px-4">Salvează coșul de cumpărături</td>
                    <td className="py-3 px-4">7 zile</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 px-4">preferences</td>
                    <td className="py-3 px-4">La Bella Italia</td>
                    <td className="py-3 px-4">Reține preferințele utilizatorului</td>
                    <td className="py-3 px-4">1 an</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 px-4">_ga</td>
                    <td className="py-3 px-4">Google Analytics</td>
                    <td className="py-3 px-4">Statistici de trafic</td>
                    <td className="py-3 px-4">2 ani</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">cookie_consent</td>
                    <td className="py-3 px-4">La Bella Italia</td>
                    <td className="py-3 px-4">Reține consimțământul pentru cookie-uri</td>
                    <td className="py-3 px-4">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">⚙️</span>
              Cum să gestionați cookie-urile
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <p className="text-stone-600 leading-relaxed">
                Puteți controla și/sau șterge cookie-urile după preferințe. Aveți posibilitatea de a șterge toate cookie-urile care sunt deja pe dispozitivul dumneavoastră și puteți seta majoritatea browserelor să prevină plasarea acestora.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <span className="text-2xl">🌐</span>
                  <span className="text-stone-700">Google Chrome</span>
                </a>
                <a href="https://support.mozilla.org/ro/kb/activarea-si-dezactivarea-cookie-urilor" target="_blank" className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <span className="text-2xl">🦊</span>
                  <span className="text-stone-700">Mozilla Firefox</span>
                </a>
                <a href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac" target="_blank" className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <span className="text-2xl">🧭</span>
                  <span className="text-stone-700">Safari</span>
                </a>
                <a href="https://support.microsoft.com/ro-ro/microsoft-edge/stergerea-cookie-urilor-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <span className="text-2xl">🌊</span>
                  <span className="text-stone-700">Microsoft Edge</span>
                </a>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">⚠️</span>
              Ce se întâmplă dacă dezactivați cookie-urile?
            </h2>
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <p className="text-stone-600 leading-relaxed">
                Dacă alegeți să dezactivați cookie-urile, este posibil ca unele funcții ale site-ului nostru să nu funcționeze corespunzător. De exemplu:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2 mt-4">
                <li>Nu veți putea rămâne conectat la contul dumneavoastră</li>
                <li>Coșul de cumpărături s-ar putea goli la fiecare vizită</li>
                <li>Preferințele dumneavoastră nu vor fi salvate</li>
                <li>Unele pagini s-ar putea încărca mai lent</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">📧</span>
              Contact
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <p className="text-stone-600 leading-relaxed mb-4">
                Pentru întrebări despre utilizarea cookie-urilor pe site-ul nostru, ne puteți contacta la:
              </p>
              <div className="space-y-2 text-stone-700">
                <p><strong>Email:</strong> privacy@labellaitalia.ro</p>
                <p><strong>Telefon:</strong> +40 721 234 567</p>
                <p><strong>Adresă:</strong> Strada Roma 123, Sector 1, București</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
