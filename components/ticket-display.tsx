"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import QRCode from "qrcode"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Download,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Copy,
  Printer
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Order,
  Participant,
  TICKET_TYPES,
  ACTIVITIES,
  EVENT_INFO,
} from "@/lib/types"

interface TicketDisplayProps {
  order: Order & { participants: Participant[] }
}

export function TicketDisplay({ order }: TicketDisplayProps) {
  const router = useRouter()
  
  // Accepte "validated" ou "confirmed"
  const isPaid = order.payment_status === "validated" || order.payment_status === "confirmed"

  // ÉCOUTEUR REALTIME : Met à jour la page du client quand l'admin valide !
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`order-status-${order.id}`)
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders', 
          filter: `id=eq.${order.id}` 
        }, 
        () => {
          toast.success("Mise à jour de votre billet !", {
            description: "Le statut de votre commande a été modifié."
          })
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, router])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Lien sauvegardé ! Gardez-le précieusement pour revenir sur cette page.")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-4xl print:max-w-full">
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 print:hidden">
        <Button onClick={handleCopyLink} variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold rounded-full">
          <Copy className="w-4 h-4 mr-2" /> 
          Sauvegarder le lien du ticket
        </Button>
        {isPaid && (
          <Button onClick={handlePrint} className="bg-[#0a1628] hover:bg-[#1a2d4c] text-white font-semibold rounded-full">
            <Printer className="w-4 h-4 mr-2" /> 
            Imprimer / Télécharger en PDF
          </Button>
        )}
      </div>

      <div className="relative mb-8 overflow-hidden rounded-2xl print:hidden shadow-xl">
        <div className="absolute inset-0">
          <Image
            src="/images/fond.jpg"
            alt="Background"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 to-[#0f2035]" />
        </div>

        <div className="relative z-10 p-8 text-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <h1 className="font-orbitron text-3xl font-black text-white">
              JAPAN <span className="text-[#c41e3a]">EXPO</span>
            </h1>
            <p className="text-sm font-bold tracking-widest text-[#f0c040]">{EVENT_INFO.edition}</p>
          </Link>
          <p className="mt-2 text-sm text-white/60 uppercase tracking-widest">{EVENT_INFO.organizer}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 flex items-center gap-3 rounded-xl border p-5 print:hidden shadow-sm ${
          isPaid
            ? "border-green-500/30 bg-green-500/10"
            : "border-amber-500/30 bg-amber-500/10"
        }`}
      >
        {isPaid ? (
          <>
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-bold text-lg text-green-500">Paiement confirmé</p>
              <p className="text-sm text-slate-600">
                Vos billets sont prêts! Présentez le QR code à l&apos;entrée.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-bold text-lg text-amber-500">
                En attente de confirmation
              </p>
              <p className="text-sm text-slate-600">
                Votre paiement est en cours de vérification. Sauvegardez le lien de cette page et revenez plus tard.
              </p>
            </div>
          </>
        )}
      </motion.div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300">
        <h2 className="mb-4 font-orbitron text-lg font-bold text-slate-900 uppercase">
          Récapitulatif
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Email</p>
            <p className="font-medium text-slate-900">{order.buyer_email || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total</p>
            <p className="font-orbitron font-bold text-[#c41e3a]">
              {order.total_amount.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Commande</p>
            <p className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">{order.id?.slice(0, 8)}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Date</p>
            <p className="font-medium text-slate-900">
              {new Date(order.created_at || "").toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {order.participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="print:break-inside-avoid"
          >
            <TicketCard participant={participant} isPaid={isPaid} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TicketCard({ participant, isPaid }: { participant: Participant, isPaid: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const ticketInfo = TICKET_TYPES[participant.type_ticket] || {
    name: participant.type_ticket,
    price: 0,
    color: 'bg-slate-500'
  }

  useEffect(() => {
    if (canvasRef.current && isPaid) {
      const ticketUrl = `${window.location.origin}/admin/scan/verify/${participant.id}`
      QRCode.toCanvas(canvasRef.current, ticketUrl, {
        width: 140,
        margin: 2,
        color: { dark: "#0f2035", light: "#ffffff" },
      })
    }
  }, [participant.id, isPaid])

  const participantActivities =
    typeof participant.activites === "string"
      ? JSON.parse(participant.activites as string)
      : participant.activites || []

  const selectedActivities = ACTIVITIES.filter((a) =>
    participantActivities.includes(a.id)
  )

  async function downloadTicket() {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `ticket-japanexpo-${participant.prenom}-${participant.nom}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg print:border-black print:shadow-none">
      <div className="relative bg-gradient-to-r from-[#0a1628] to-[#1a2d4c] p-5 print:bg-slate-100 print:from-slate-100 print:to-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-orbitron text-xs uppercase tracking-wider text-[#f0c040] print:text-slate-500">
              {EVENT_INFO.organizer}
            </p>
            <h3 className="font-orbitron text-2xl font-black text-white print:text-slate-900">
              JAPAN EXPO
            </h3>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20 print:border-slate-300 print:bg-slate-200">
            <p className="font-orbitron text-sm font-bold text-white uppercase tracking-widest print:text-slate-900">
              {ticketInfo.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 md:flex-row bg-[#0f2035] print:bg-white">
        <div className="flex flex-col items-center justify-center md:border-r border-white/10 md:pr-6 print:border-slate-300">
          <div className={`flex h-40 w-40 items-center justify-center rounded-xl ${isPaid ? "bg-white p-2" : "bg-white/5 border border-dashed border-white/20 print:bg-slate-100"}`}>
            {isPaid ? (
              <canvas ref={canvasRef} className="rounded-lg" />
            ) : (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-white/30 print:text-slate-400" />
                <p className="text-xs text-white/50 print:text-slate-500">QR code bloqué</p>
              </div>
            )}
          </div>

          {isPaid && (
            <Button variant="ghost" size="sm" onClick={downloadTicket} className="mt-3 text-white/70 hover:text-white hover:bg-white/10 print:hidden w-full">
              <Download className="mr-2 h-4 w-4" /> Sauvegarder QR
            </Button>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 print:text-slate-500 mb-1">
                Détenteur du billet
              </p>
              <h4 className="font-orbitron text-3xl font-black uppercase text-white print:text-slate-900">
                {participant.prenom} {participant.nom}
              </h4>
            </div>

            {participant.is_checked_in && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 print:border-green-600 print:text-green-700 py-1.5 px-3">
                <CheckCircle className="mr-2 h-4 w-4" /> Scanné
              </Badge>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 print:bg-slate-50 print:border border-white/5">
              <Calendar className="h-5 w-5 text-[#f0c040]" />
              <span className="text-white font-medium print:text-slate-700">{EVENT_INFO.date}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 print:bg-slate-50 print:border border-white/5">
              <Clock className="h-5 w-5 text-[#f0c040]" />
              <span className="text-white font-medium print:text-slate-700">{EVENT_INFO.time}</span>
            </div>
            
            {/* LIEN MAPS CLIQUABLE */}
            <a href={`https://maps.google.com/?q=$${encodeURIComponent(EVENT_INFO.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer border-white/5 print:bg-slate-50 print:border">
              <MapPin className="h-5 w-5 text-[#5ba3e0]" />
              <span className="text-[#5ba3e0] hover:underline font-medium print:text-slate-700">{EVENT_INFO.location}</span>
            </a>
            
            {/* LIEN TÉLÉPHONE CLIQUABLE */}
            <a href={`tel:${EVENT_INFO.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer border-white/5 print:bg-slate-50 print:border">
              <Phone className="h-5 w-5 text-[#5ba3e0]" />
              <span className="text-[#5ba3e0] hover:underline font-medium print:text-slate-700">{EVENT_INFO.phone}</span>
            </a>
          </div>

          {selectedActivities.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50 print:text-slate-500">
                Activités incluses
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedActivities.map((activity) => (
                  <Badge key={activity.id} className="bg-[#1e4a7c]/40 border-[#5ba3e0]/30 text-white px-3 py-1.5 print:border-slate-300 print:text-slate-700 print:bg-white font-medium">
                    {activity.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}