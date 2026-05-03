"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { HeroSection } from "@/components/hero-section"
import { ActivitiesSection } from "@/components/activities-section"
import { TicketCards } from "@/components/ticket-cards"
import { Footer } from "@/components/footer"
import { HeartHandshake } from "lucide-react"

export default function Home() {
  return (
    // POLICES MODERNES (INTER / GEIST)
    <main className="relative min-h-screen bg-slate-50 font-sans text-slate-950">
      
      {/* 1. IMAGE DE FOND SUBTILE EGGHEAD (Oreki Protocol) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image 
          src="/images/fond.jpg" // Télécharge ton image Pinterest et mets-la ici
          alt="" 
          fill 
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-slate-50" />
      </div>

      <div className="relative z-10">
        <HeroSection />
        
        {/* 2. SECTION CHARITABLE IMPACT (Transparence Tabaski) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative py-20 px-4 bg-white/80 backdrop-blur-sm shadow-inner"
        >
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-10 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-xl shadow-blue-500/5">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700">
                    <HeartHandshake className="h-5 w-5" /> Mission Humanitaire ESP Dakar
                  </div>
                  <h2 className="font-orbitron text-4xl font-black uppercase text-slate-950 md:text-5xl tracking-tight leading-tight">
                    Une action solidaire pour la <span className="text-red-600 drop-shadow-sm">Tabaski</span>
                  </h2>
                  <p className="text-lg font-medium text-slate-700">
                     Tous les fonds collectés lors de cette Japan Expo Dakar seront **exclusivement réinvestis** pour l&apos;achat de kits de denrées alimentaires et de moutons pour la Tabaski.
                  </p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-lg relative aspect-video w-full max-w-sm">
                    {/* Image Solidaire Spécifique */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden mb-3">
                        <Image 
                            src="/images/Luffy.jpg" // Télécharge la 2e image Pinterest et mets-la ici
                            alt="Action solidaire Tabaski Campus ESP"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <p className="text-center text-slate-900 font-bold text-lg leading-relaxed px-2">
                       La Japan Expo Dakar est une initiative philanthropique visant à garantir une Tabaski digne à ceux qui en ont le plus besoin.
                    </p>
                </div>
            </div>
          </div>
        </motion.section>
        
        <ActivitiesSection />
        
        <TicketCards />
        
        <Footer />
      </div>
    </main>
  )
}