"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Phone, Ticket } from "lucide-react"
import { EVENT_INFO } from "@/lib/types"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background Egghead (Clair et lumineux) */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/egghead-bg.png"
          alt="Egghead Island Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-slate-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Poster Image (Mise en valeur futuriste) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative w-full max-w-md lg:max-w-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white p-2 shadow-2xl shadow-blue-500/20 ring-1 ring-slate-200">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/poster.png"
                  alt="Japan Expo ESP 4e Édition"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Glow effect Egghead */}
            <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-tr from-blue-400/30 via-red-500/20 to-yellow-400/30 blur-3xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Logo and Title */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-3 inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-700"
              >
                {EVENT_INFO.organizer}
              </motion.div>
              <h1 className="font-orbitron text-6xl font-black uppercase tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
                <span className="block text-slate-800">JAPAN</span>
                <span className="block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                  EXPO
                </span>
              </h1>
              <div className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2 shadow-md shadow-blue-500/30">
                <span className="font-orbitron text-xl font-bold tracking-widest text-white">
                  {EVENT_INFO.edition}
                </span>
              </div>
            </div>

            {/* Event Info Cards (Glassmorphism) */}
            <div className="mb-8 grid w-full gap-4 sm:grid-cols-3">
              <InfoCard icon={<Calendar />} label="DATE" value={EVENT_INFO.date} subValue={EVENT_INFO.time} />
              <InfoCard icon={<MapPin />} label="LIEU" value={EVENT_INFO.location} />
              <InfoCard icon={<Phone />} label="INFOS" value={EVENT_INFO.phone} />
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full sm:w-auto"
            >
              <Link href="/tickets">
                <Button
                  size="lg"
                  className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-red-600 to-red-500 px-10 py-7 text-lg font-bold uppercase tracking-wide text-white shadow-xl shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/50 sm:w-auto"
                >
                  <Ticket className="mr-3 h-6 w-6 transition-transform group-hover:rotate-12" />
                  Réserver Mon Pass
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function InfoCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="font-bold text-slate-900">{value}</p>
        {subValue && <p className="text-xs font-medium text-slate-500">{subValue}</p>}
      </div>
    </div>
  )
}