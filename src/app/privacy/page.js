"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function PrivacyPage() {
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
            Politica de <span className="text-amber-400">Confidențialitate</span>
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
              Introducere
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                La Bella Italia (denumită în continuare "noi", "al nostru" sau "Restaurantul") respectă confidențialitatea vizitatorilor și clienților săi. Această politică de confidențialitate explică modul în care colectăm, utilizăm și protejăm informațiile dumneavoastră personale atunci când utilizați site-ul nostru web sau serviciile noastre.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">2</span>
              Informațiile pe care le colectăm
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Informații furnizate direct de dumneavoastră:</h3>
                <ul className="list-disc list-inside text-stone-600 space-y-2">
                  <li>Numele și prenumele</li>
                  <li>Adresa de email</li>
                  <li>Numărul de telefon</li>
                  <li>Adresa de livrare (pentru comenzi)</li>
                  <li>Informații despre rezervări (data, ora, număr de persoane)</li>
                  <li>Preferințe alimentare și alergii</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Informații colectate automat:</h3>
                <ul className="list-disc list-inside text-stone-600 space-y-2">
                  <li>Adresa IP</li>
                  <li>Tipul de browser și dispozitiv</li>
                  <li>Paginile vizitate și timpul petrecut pe site</li>
                  <li>Cookie-uri și tehnologii similare</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">3</span>
              Cum utilizăm informațiile
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Procesarea și confirmarea rezervărilor</li>
                <li>Livrarea comenzilor și comunicarea cu clienții</li>
                <li>Trimiterea de confirmări, facturi și notificări</li>
                <li>Îmbunătățirea serviciilor și experienței utilizatorilor</li>
                <li>Marketing și oferte speciale (cu consimțământul dumneavoastră)</li>
                <li>Respectarea obligațiilor legale</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">4</span>
              Partajarea informațiilor
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed mb-4">
                Nu vindem și nu închiriem informațiile dumneavoastră personale terților. Putem partaja informații cu:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Servicii de livrare partenere (pentru comenzile cu livrare)</li>
                <li>Procesatori de plăți (pentru tranzacții online)</li>
                <li>Autorități competente (când este cerut de lege)</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">5</span>
              Securitatea datelor
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed">
                Implementăm măsuri tehnice și organizaționale adecvate pentru a proteja informațiile dumneavoastră personale împotriva accesului neautorizat, pierderii sau distrugerii. Acestea includ criptarea datelor, firewall-uri și controale stricte de acces.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">6</span>
              Drepturile dumneavoastră
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-stone-600 leading-relaxed mb-4">
                Conform GDPR, aveți următoarele drepturi:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li><strong>Dreptul de acces</strong> - să solicitați o copie a datelor dumneavoastră</li>
                <li><strong>Dreptul la rectificare</strong> - să corectați datele inexacte</li>
                <li><strong>Dreptul la ștergere</strong> - să solicitați ștergerea datelor</li>
                <li><strong>Dreptul la restricționare</strong> - să limitați procesarea datelor</li>
                <li><strong>Dreptul la portabilitate</strong> - să primiți datele într-un format structurat</li>
                <li><strong>Dreptul de opoziție</strong> - să vă opuneți procesării datelor</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">7</span>
              Contact
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <p className="text-stone-600 leading-relaxed mb-4">
                Pentru orice întrebări sau solicitări legate de această politică de confidențialitate, ne puteți contacta la:
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
