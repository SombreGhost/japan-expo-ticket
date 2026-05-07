"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const tickets = [
  {
    type: "EXPO",
    name: "Ticket Exposition",
    price: 1000,
    features: ["Accès Exposition", "Zone Vendeurs", "Stands de nourriture", "Photobooth One Piece"],
    color: "slate",
    cta: "Réserver",
    popular: false
  },
  {
    type: "EXPO_CAT",
    name: "Ticket Expo + CAT",
    price: 2000,
    features: ["Tout du Ticket Exposition", "Participation CHASSE AU TRÉSOR", "Lots à gagner", "Accès spectateur aux concours"],
    color: "blue",
    cta: "Réserver",
    popular: false
  },
  {
    type: "ALL_ACCESS",
    name: "Ticket All Access",
    price: 3000,
    features: ["Tout du Ticket Expo + CAT", "Karaoké", "Concours Cosplay", "Dessin", "Quizz", "Blind Test"],
    color: "red",
    cta: "Réserver",
    popular: true
  }
]

export function TicketCards() {
  return (
    <section id="tickets" className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image src="/images/fond.jpg" alt="Background pattern" fill className="object-cover" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-outfit text-4xl md:text-5xl font-black uppercase text-slate-900 mb-4 tracking-tighter">
            Réserve ton <span className="text-[#c41e3a]">Accès</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Choisis le pass qui te convient. Les places sont limitées, ne tarde pas !
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[2rem] p-8 shadow-xl border-2 flex flex-col h-full ${
                ticket.color === 'red' ? 'border-red-600 shadow-red-200 md:-translate-y-4' : 
                ticket.color === 'blue' ? 'border-blue-200' : 'border-slate-200'
              }`}
            >
              {ticket.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black uppercase text-xs tracking-widest py-1 px-4 rounded-full">
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

              {/* NOUVEAU LIEN : Envoie le paramètre "type" au formulaire */}
              <Link href={`/tickets?type=${ticket.type}`}>
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