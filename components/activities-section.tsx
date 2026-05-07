"use client"

import { motion } from "framer-motion"
import { Palette, Music, Gamepad2, PenTool, HelpCircle, Map } from "lucide-react"
import { ACTIVITIES } from "@/lib/types"

// J'ai ajouté quelques clés alternatives au cas où les IDs dans types.ts seraient différents
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cosplays: Palette,
  cosplay: Palette,
  karaoke: Music,
  dessin: PenTool,
  jeux: Gamepad2,
  quizz: HelpCircle,
  chasse_tresor: Map,
  cat: Map,
}

export function ActivitiesSection() {
  return (
    <section className="relative overflow-hidden bg-[#0f2035] py-24 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#1e4a7c]/20 blur-[120px]" />
        <div className="absolute top-0 right-1/4 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c41e3a]/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-orbitron mb-4 text-4xl font-black text-white sm:text-5xl uppercase tracking-wider">
            Activités <span className="text-[#5ba3e0]">Exclusives</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
            Plus qu&apos;une expo, une expérience immersive dans la culture japonaise
          </p>
        </motion.div>

        {/* Grille centrée et ajustée */}
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 justify-center">
          {ACTIVITIES.map((activity, index) => {
            const Icon = iconMap[activity.id] || Palette
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group h-full"
              >
                <div className="relative flex h-full min-h-[180px] flex-col items-center justify-start rounded-2xl border border-white/10 bg-[#0a1628]/40 p-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-[#5ba3e0]/50 hover:bg-[#0a1628]/80 hover:shadow-[0_10px_30px_-10px_rgba(91,163,224,0.3)]">
                  
                  {/* Effet de lueur au survol */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5ba3e0]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex flex-col items-center w-full">
                    {/* Conteneur de l'icône */}
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1e4a7c]/30 border border-[#1e4a7c]/50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#1e4a7c]/50">
                      <Icon className="h-8 w-8 text-[#5ba3e0]" />
                    </div>

                    <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                      {activity.name}
                    </h3>
                    
                    <p className="mt-3 text-xs text-white/50 hidden sm:block leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}