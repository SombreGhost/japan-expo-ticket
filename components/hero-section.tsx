"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Phone, Ticket } from "lucide-react"
import { EVENT_INFO } from "@/lib/types"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background with Egghead Island */}
      <div className="absolute inset-0">
        <Image
          src="/images/egghead-bg.png"
          alt="Egghead Island Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 via-[#0a1628]/60 to-[#0a1628]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Poster Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-md lg:max-w-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl shadow-[#c41e3a]/30 ring-4 ring-white/10">
              <Image
                src="/images/poster.png"
                alt="Japan Expo ESP 4e Édition - One Piece Egghead Arc"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-[#c41e3a]/20 via-[#1e4a7c]/20 to-[#c41e3a]/20 blur-2xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Logo and Title */}
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-2 text-sm font-medium uppercase tracking-widest text-[#f0c040]"
              >
                {EVENT_INFO.organizer}
              </motion.div>
              <h1 className="font-orbitron text-5xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
                <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  JAPAN
                </span>
                <span className="block bg-gradient-to-r from-[#c41e3a] to-[#ff6b6b] bg-clip-text text-transparent">
                  EXPO
                </span>
              </h1>
              <div className="mt-2 inline-block rounded-lg bg-[#c41e3a] px-4 py-1">
                <span className="font-orbitron text-lg font-bold text-white">
                  {EVENT_INFO.edition}
                </span>
              </div>
            </div>

            {/* Event Info Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <InfoCard
                icon={<Calendar className="h-5 w-5" />}
                label="DATE"
                value={EVENT_INFO.date}
                subValue={EVENT_INFO.time}
              />
              <InfoCard
                icon={<MapPin className="h-5 w-5" />}
                label="LIEU"
                value={EVENT_INFO.location}
              />
              <InfoCard
                icon={<Phone className="h-5 w-5" />}
                label="INFOS"
                value={EVENT_INFO.phone}
              />
            </div>

            {/* Activities */}
            <div className="mb-8">
              <p className="mb-3 text-sm uppercase tracking-wider text-white/60">
                Activités
              </p>
              <div className="flex flex-wrap gap-2">
                {['COSPLAYS', 'KARAOKÉ', 'DESSIN', 'JEUX', 'QUIZZ', 'CHASSE AU TRÉSOR'].map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            {/* Surcharge Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6 rounded-lg border border-[#f0c040]/30 bg-[#f0c040]/10 px-4 py-2"
            >
              <p className="text-sm font-semibold text-[#f0c040]">
                {EVENT_INFO.surchargeNote}
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link href="/inscription">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#c41e3a] to-[#ff4757] px-8 py-6 text-lg font-bold uppercase tracking-wider text-white shadow-lg shadow-[#c41e3a]/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#c41e3a]/50"
                >
                  <Ticket className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  Réserver Mon Ticket
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#ff4757] to-[#c41e3a] opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Animated particles/clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-64 w-64 rounded-full bg-white/5 blur-3xl"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, "-100%"],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </section>
  )
}

function InfoCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a1628]/80 px-4 py-3 backdrop-blur-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e4a7c]/50 text-[#5ba3e0]">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
        <p className="font-semibold text-white">{value}</p>
        {subValue && <p className="text-xs text-white/60">{subValue}</p>}
      </div>
    </motion.div>
  )
}
