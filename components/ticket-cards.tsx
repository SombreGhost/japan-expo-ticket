"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const tickets = [
  {
    name: "Ticket Exposition",
    price: 1000,
    features: ["Accès Exposition", "Zone Vendeurs", "Stands de nourriture", "Photocall Egghead"],
    color: "slate",
    cta: "Réserver",
    popular: false
  },
  {
    name: "Ticket Expo + CQT",
    price: 2000,
    features: ["Tout du Ticket Exposition", "Participation CHASSE AU TRÉSOR", "1 Chance au Tirage au sort"],
    color: "blue",
    cta: "Réserver",
    popular: false
  },
  {
    name: "Ticket All Access",
    price: 3000,
    features: ["Tout du Ticket Expo + CQT", "Karaoké", "Concours Cosplay", "Tournois Jeux", "Quizz & Dessin"],
    color: "red",
    cta: "Réserver",
    popular: true // Déplacé sur le 3ème ticket comme exigé
  }
]

export function TicketCards() {
  return (
    <section id="tickets" className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image src="/images/fond.jpg" alt="" fill className="object-cover" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-outfit text-5xl font-black uppercase text-slate-950 italic tracking-tighter">
            Choisis ton <span className="text-red-600">Ticket</span>
          </h2>
          <div className="bg-red-50 text-red-600 inline-block px-6 py-2 rounded-full font-bold border border-red-100">
            ⚠️ Note : Paiement sur place = +500 FCFA sur tous les tickets
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tickets.map((ticket, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border-2 bg-white transition-all ${
                ticket.popular 
                  ? 'border-red-500 shadow-2xl shadow-red-500/10 scale-105 z-20' 
                  : 'border-slate-100 shadow-xl'
              }`}
            >
              {ticket.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full text-sm font-black uppercase tracking-tighter shadow-lg whitespace-nowrap">
                  Le plus populaire
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="font-outfit text-2xl font-black uppercase text-slate-900 mb-2">{ticket.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-950 font-outfit">{ticket.price}</span>
                  <span className="text-lg font-bold text-slate-500">FCFA</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {ticket.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-slate-700 font-medium">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/tickets">
                <Button className={`w-full h-16 rounded-2xl text-lg font-black uppercase shadow-lg transition-all ${
                  ticket.color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                  ticket.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-slate-900 hover:bg-black text-white'
                }`}>
                  {ticket.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}