"use client"

import { motion } from "framer-motion"
import { Palette, Music, Gamepad2, PenTool, HelpCircle, Map } from "lucide-react"
import { ACTIVITIES } from "@/lib/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cosplays: Palette,
  karaoke: Music,
  dessin: PenTool,
  jeux: Gamepad2,
  quizz: HelpCircle,
  chasse_tresor: Map,
}

export function ActivitiesSection() {
  return (
    <section className="relative overflow-hidden bg-[#0f2035] py-20 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#1e4a7c]/20 blur-3xl" />
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#c41e3a]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-orbitron mb-4 text-3xl font-bold text-white sm:text-4xl">
            Activités <span className="text-[#5ba3e0]">Exclusives</span>
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Plus qu&apos;une expo, une expérience immersive dans la culture japonaise
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ACTIVITIES.map((activity, index) => {
            const Icon = iconMap[activity.id] || Palette
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative flex h-full flex-col items-center rounded-xl border border-white/10 bg-[#0a1628]/80 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#5ba3e0]/50 hover:bg-[#0a1628]">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#5ba3e0]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e4a7c] to-[#0a1628] transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7 text-[#5ba3e0]" />
                    </div>

                    <h3 className="font-orbitron text-sm font-semibold uppercase tracking-wide text-white">
                      {activity.name}
                    </h3>
                    <p className="mt-1 text-xs text-white/50 hidden sm:block">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Activity badges like the poster */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {["COSPLAYS", "KARAOKÉ", "DESSIN", "JEUX", "QUIZZ", "CHASSE AU TRÉSOR"].map(
            (name, i) => (
              <span
                key={name}
                className="rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium uppercase tracking-wider text-white/80"
              >
                {name}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}
