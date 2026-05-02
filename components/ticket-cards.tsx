"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TICKET_TYPES, TicketType, EVENT_INFO } from "@/lib/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export function TicketCards() {
  const tickets = Object.values(TICKET_TYPES)

  return (
    <section id="tickets" className="relative overflow-hidden bg-[#0a1628] py-20 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#c41e3a]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#1e4a7c]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-orbitron mb-4 text-3xl font-bold text-white sm:text-4xl">
            Choisis ton <span className="text-[#c41e3a]">Pass</span>
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Trois niveaux d&apos;accès pour vivre Japan Expo ESP à ta façon
          </p>
          <div className="mt-4 inline-block rounded-lg border border-[#f0c040]/30 bg-[#f0c040]/10 px-4 py-2">
            <p className="text-sm font-semibold text-[#f0c040]">
              {EVENT_INFO.surchargeNote}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.type}
              ticket={ticket}
              featured={index === 2} // ALL ACCESS is featured
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TicketCard({
  ticket,
  featured,
  index,
}: {
  ticket: (typeof TICKET_TYPES)[TicketType]
  featured?: boolean
  index: number
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div
        className={`relative h-full overflow-hidden rounded-2xl border-2 ${
          featured
            ? "border-[#f0c040] bg-gradient-to-br from-[#c41e3a] to-[#8b0000] shadow-xl shadow-[#c41e3a]/30"
            : "border-white/10 bg-[#0f2035]"
        }`}
      >
        {/* Featured badge */}
        {featured && (
          <div className="absolute -right-8 top-6 rotate-45 bg-[#f0c040] px-10 py-1 text-xs font-bold uppercase text-[#0a1628]">
            <Sparkles className="mr-1 inline h-3 w-3" />
            VIP
          </div>
        )}

        {/* Header with price - styled like the poster */}
        <div className={`p-6 ${featured ? "text-white" : ""}`}>
          {/* Price block styled like the poster */}
          <div
            className={`mb-4 rounded-xl p-4 ${
              featured
                ? "bg-white/10"
                : "bg-gradient-to-r from-[#c41e3a] to-[#a01530]"
            }`}
          >
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-orbitron text-4xl font-black text-white">
                {ticket.price.toLocaleString("fr-FR")}
              </span>
              <span className="text-lg font-bold text-white/80">FCFA</span>
            </div>
            <p className="mt-1 text-center font-orbitron text-sm font-bold uppercase tracking-wider text-white">
              {ticket.name}
            </p>
          </div>

          {/* Day-of price */}
          <p className="mb-4 text-center text-xs text-white/50">
            Jour J: {ticket.priceDayOf.toLocaleString("fr-FR")} FCFA
          </p>

          {/* Description */}
          <p
            className={`mb-6 text-center text-sm ${
              featured ? "text-white/80" : "text-white/60"
            }`}
          >
            {ticket.description}
          </p>

          {/* Features */}
          <ul className="mb-6 space-y-3">
            {ticket.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    featured ? "bg-[#f0c040] text-[#0a1628]" : "bg-[#c41e3a] text-white"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span
                  className={`text-sm ${
                    featured ? "text-white/90" : "text-white/70"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="p-6 pt-0">
          <Link href="/inscription" className="block w-full">
            <Button
              className={`w-full py-6 font-orbitron text-sm font-bold uppercase tracking-wider transition-all ${
                featured
                  ? "bg-[#f0c040] text-[#0a1628] hover:bg-[#f0c040]/90 hover:shadow-lg hover:shadow-[#f0c040]/30"
                  : "bg-gradient-to-r from-[#c41e3a] to-[#ff4757] text-white hover:shadow-lg hover:shadow-[#c41e3a]/30"
              }`}
            >
              Sélectionner
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        {!featured && (
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#c41e3a]/5 blur-2xl" />
        )}
      </div>
    </motion.div>
  )
}
