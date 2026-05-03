"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TICKET_TYPES, TicketType, EVENT_INFO } from "@/lib/types"

export function TicketCards() {
  const tickets = Object.values(TICKET_TYPES)

  return (
    <section id="tickets" className="relative bg-slate-50 py-24 px-4">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-orbitron mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
            Choisis ton <span className="text-red-600">Pass</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Dévérouille ton accès à l'arc Egghead de la Japan Expo ESP.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {tickets.map((ticket, index) => (
            <TicketCard key={ticket.type} ticket={ticket} featured={index === 2} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TicketCard({ ticket, featured }: { ticket: (typeof TICKET_TYPES)[TicketType], featured: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex h-full"
    >
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-[2rem] border-2 bg-white p-8 ${
          featured
            ? "border-yellow-400 shadow-2xl shadow-yellow-500/20"
            : "border-slate-100 shadow-xl shadow-slate-200/50"
        }`}
      >
        {featured && (
          <div className="absolute right-0 top-0 rounded-bl-3xl bg-yellow-400 px-6 py-2 font-bold uppercase text-yellow-950">
            <Sparkles className="mr-2 inline h-4 w-4" />
            Ultime
          </div>
        )}

        <div className="mb-8">
          <h3 className="font-orbitron text-2xl font-black uppercase text-slate-900">
            {ticket.name}
          </h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`font-orbitron text-5xl font-black ${featured ? "text-red-600" : "text-blue-600"}`}>
              {ticket.price.toLocaleString("fr-FR")}
            </span>
            <span className="text-xl font-bold text-slate-500">FCFA</span>
          </div>
          <p className="mt-2 text-sm font-medium text-red-500">
            Jour J: {ticket.priceDayOf.toLocaleString("fr-FR")} FCFA
          </p>
        </div>

        <ul className="mb-8 flex-1 space-y-4">
          {ticket.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-slate-700">
              <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${featured ? "bg-yellow-400 text-yellow-900" : "bg-blue-100 text-blue-600"}`}>
                <Check className="h-3 w-3" />
              </div>
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        <Link href="/tickets" className="mt-auto block w-full">
          <Button
            className={`w-full rounded-full py-6 font-bold uppercase tracking-widest transition-all ${
              featured
                ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
            }`}
          >
            Sélectionner
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}