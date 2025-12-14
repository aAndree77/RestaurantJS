"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function TermsPage() {
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
            Termeni și <span className="text-amber-400">Condiții</span>
          </h1>
          <p className="text-stone-300">Ultima actualizare: 13 Decembrie 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg prose-stone max-w-none">
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">1</span>
              Acceptarea termenilor
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                Prin accesarea și utilizarea site-ului web La Bella Italia, acceptați să fiți obligat de acești termeni și condiții. Dacă nu sunteți de acord cu oricare dintre acești termeni, vă rugăm să nu utilizați site-ul nostru. Ne rezervăm dreptul de a modifica acești termeni în orice moment, modificările intrând în vigoare imediat după publicare.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">2</span>
              Serviciile noastre
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <p className="text-stone-600 leading-relaxed">
                La Bella Italia oferă următoarele servicii prin intermediul platformei noastre:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Vizualizarea meniului și a prețurilor</li>
                <li>Comandarea online de preparate culinare</li>
                <li>Rezervări de mese</li>
                <li>Informații despre restaurant și evenimente</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">3</span>
              Comenzi și plăți
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Plasarea comenzilor:</h3>
                <ul className="list-disc list-inside text-stone-600 space-y-2">
                  <li>Comenzile sunt considerate confirmate după primirea confirmării prin email sau SMS</li>
                  <li>Prețurile afișate includ TVA</li>
                  <li>Ne rezervăm dreptul de a refuza comenzi în cazuri excepționale</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Metode de plată acceptate:</h3>
                <ul className="list-disc list-inside text-stone-600 space-y-2">
                  <li>Numerar la livrare sau în restaurant</li>
                  <li>Card bancar (Visa, Mastercard, Maestro)</li>
                  <li>Plată online securizată</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">4</span>
              Rezervări
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Rezervările pot fi făcute online sau telefonic</li>
                <li>Masa va fi păstrată 15 minute după ora rezervată</li>
                <li>Anulările trebuie făcute cu cel puțin 2 ore înainte</li>
                <li>Pentru grupuri mari (peste 8 persoane), vă rugăm să ne contactați telefonic</li>
                <li>Ne rezervăm dreptul de a solicita un depozit pentru rezervări speciale</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">5</span>
              Livrare
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Livrăm în București și zonele limitrofe</li>
                <li>Timpul estimat de livrare este de 30-60 minute</li>
                <li>Comanda minimă pentru livrare este de 50 RON</li>
                <li>Costul livrării variază în funcție de distanță</li>
                <li>Nu suntem responsabili pentru întârzieri cauzate de condiții meteo extreme sau alte situații de forță majoră</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">6</span>
              Anulări și rambursări
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Comenzile pot fi anulate în maximum 5 minute de la plasare</li>
                <li>Rambursările se procesează în 5-7 zile lucrătoare</li>
                <li>Nu acceptăm returnarea preparatelor din motive de gust personal</li>
                <li>Reclamațiile privind calitatea trebuie făcute în maximum 2 ore de la primire</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">7</span>
              Proprietate intelectuală
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                Tot conținutul site-ului, inclusiv texte, imagini, logo-uri, grafice și design, sunt proprietatea La Bella Italia și sunt protejate de legile privind drepturile de autor. Este interzisă reproducerea, distribuirea sau utilizarea comercială fără acordul nostru scris.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">8</span>
              Limitarea răspunderii
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                În măsura permisă de lege, La Bella Italia nu va fi răspunzătoare pentru niciun fel de daune indirecte, incidentale sau consecvențe care rezultă din utilizarea sau incapacitatea de a utiliza serviciile noastre. Răspunderea noastră totală nu va depăși valoarea comenzii.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">9</span>
              Legislație aplicabilă
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                Acești termeni și condiții sunt guvernați de legile din România. Orice dispută va fi soluționată de instanțele competente din București.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">10</span>
              Contact
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <p className="text-stone-600 leading-relaxed mb-4">
                Pentru întrebări sau nelămuriri privind acești termeni, ne puteți contacta la:
              </p>
              <div className="space-y-2 text-stone-700">
                <p><strong>Email:</strong> legal@labellaitalia.ro</p>
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
