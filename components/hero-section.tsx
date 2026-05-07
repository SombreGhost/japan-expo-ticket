"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, MessageCircle, Ticket } from "lucide-react"

export function HeroSection() {
  const whatsappUrl = "https://wa.me/221761522940"
  const calendarUrl = "https://www.google.com/calendar/render?action=TEMPLATE&text=Japan+Expo+ESP+Egghead&details=Journée+solidaire+pour+la+Tabaski&location=ESP+Dakar"
  const mapsUrl = "https://maps.app.goo.gl/uXvY6pZ8o6V6"

  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 lg:py-20 overflow-hidden">
      {/* Fond subtil */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/fond.jpg"
          alt="Fond"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white/80 to-slate-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* GAUCHE : L'AFFICHE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md lg:flex-1"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-2xl border-8 border-white ring-1 ring-slate-200">
              <Image
                src="/images/poster.png" // Télécharge ton affiche Pinterest et mets-la ici
                alt="Japan Expo Affiche"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* DROITE : CONTENU */}
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="space-y-4">
              <h2 className="text-blue-600 font-bold tracking-[0.3em] uppercase text-sm">Campus ESP Dakar</h2>
              <h1 className="font-outfit text-6xl font-black uppercase text-slate-950 md:text-8xl tracking-tighter leading-[0.85]">
                JAPAN <span className="text-red-600">EXPO</span><br/>
                <span className="text-blue-600">EGGHEAD</span>
              </h1>
            </div>

            {/* LIGNE INFOS UNIFIÉE */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 py-6 border-y border-slate-200/60">
              <a href={calendarUrl} target="_blank" className="flex items-center gap-2 group">
                <Calendar className="h-5 w-5 text-red-600" />
                <span className="text-slate-900 font-extrabold uppercase text-sm tracking-tight group-hover:text-red-600 transition-colors">16 Mai 2025</span>
              </a>
              <div className="hidden sm:block h-4 w-px bg-slate-300" />
              <a href={mapsUrl} target="_blank" className="flex items-center gap-2 group">
                <MapPin className="h-5 w-5 text-red-600" />
                <span className="text-slate-900 font-extrabold uppercase text-sm tracking-tight group-hover:text-red-600 transition-colors">ESP Dakar</span>
              </a>
              <div className="hidden sm:block h-4 w-px bg-slate-300" />
              <a href={whatsappUrl} target="_blank" className="flex items-center gap-2 group">
                <MessageCircle className="h-5 w-5 text-red-600" />
                <span className="text-slate-900 font-extrabold uppercase text-sm tracking-tight group-hover:text-red-600 transition-colors">76 152 29 40</span>
              </a>
            </div>

            {/* CTA BOUTON ÉVIDENCE */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Link href="/tickets" className="w-full sm:w-auto">
                <Button className="group w-full h-24 px-16 rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/40 hover:bg-red-700 hover:scale-105 transition-all">
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Accès Immédiat</span>
                    <span className="font-outfit text-3xl font-black uppercase flex items-center">
                       Réserver mon ticket <Ticket className="ml-4 h-8 w-8 group-hover:rotate-12 transition-transform" />
                    </span>
                  </div>
                </Button>
              </Link>
            </div>
            
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Note : Tous les tickets seront majorés de +500 FCFA pour tout achat sur place.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}