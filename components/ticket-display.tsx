"use client"

import { useEffect, useRef } from "react"
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
import { toast } from "sonner" // Import pour les notifications

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
  // Prise en charge du statut selon ce qui est en base
  const isPaid = order.payment_status === "validated"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Lien sauvegardé ! Gardez-le précieusement pour revenir sur cette page.")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-4xl print:max-w-full">
      {/* Bloc Actions Utilisateur (Caché à l'impression) */}
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

      {/* Header with poster background */}
      <div className="relative mb-8 overflow-hidden rounded-2xl print:hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/egghead-bg.png"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/90 to-[#0a1628]" />
        </div>

        <div className="relative z-10 p-8 text-center">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <h1 className="font-orbitron text-3xl font-black text-white">
              JAPAN <span className="text-[#c41e3a]">EXPO</span>
            </h1>
            <p className="text-sm text-[#f0c040]">{EVENT_INFO.edition}</p>
          </Link>
          <p className="mt-2 text-sm text-white/60">{EVENT_INFO.organizer}</p>
        </div>
      </div>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 flex items-center gap-3 rounded-xl border p-4 print:hidden ${
          isPaid
            ? "border-green-500/30 bg-green-500/10"
            : "border-amber-500/30 bg-amber-500/10"
        }`}
      >
        {isPaid ? (
          <>
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">Paiement confirmé</p>
              <p className="text-sm text-white/60">
                Vos billets sont prêts! Présentez le QR code à l&apos;entrée.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-500">
                En attente de confirmation
              </p>
              <p className="text-sm text-white/60">
                Votre paiement est en cours de vérification. Sauvegardez le lien de cette page et revenez plus tard.
              </p>
            </div>
          </>
        )}
      </motion.div>

      {/* Order summary */}
      <div className="mb-8 rounded-xl border border-white/10 bg-[#0f2035] p-6 print:border-slate-300 print:bg-white">
        <h2 className="mb-4 font-orbitron text-lg font-bold text-white print:text-slate-900">
          Récapitulatif
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-white/50 print:text-slate-500">Email</p>
            <p className="font-medium text-white print:text-slate-900">{order.email || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-white/50 print:text-slate-500">Total</p>
            <p className="font-orbitron font-bold text-[#f0c040] print:text-slate-900">
              {order.total_amount.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div>
            <p className="text-white/50 print:text-slate-500">Commande</p>
            <p className="font-mono text-xs text-white print:text-slate-900">{order.id?.slice(0, 8)}</p>
          </div>
          <div>
            <p className="text-white/50 print:text-slate-500">Date</p>
            <p className="font-medium text-white print:text-slate-900">
              {new Date(order.created_at || "").toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets */}
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

function TicketCard({
  participant,
  isPaid,
}: {
  participant: Participant
  isPaid: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // SÉCURITÉ : Optional Chaining
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
        color: {
          dark: "#0a1628",
          light: "#ffffff",
        },
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
    <div className="overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0f2035] print:border-slate-300 print:bg-white print:shadow-none">
      {/* Ticket header with gradient matching poster */}
      <div className="relative bg-gradient-to-r from-[#c41e3a] to-[#a01530] p-4 print:bg-slate-100 print:from-slate-100 print:to-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-orbitron text-xs uppercase tracking-wider text-white/70 print:text-slate-500">
              {EVENT_INFO.organizer}
            </p>
            <h3 className="font-orbitron text-xl font-black text-white print:text-slate-900">
              JAPAN EXPO
            </h3>
          </div>
          <div className="rounded-lg bg-white/20 px-3 py-1 print:bg-slate-200">
            <p className="font-orbitron text-sm font-bold text-white print:text-slate-900">
              {ticketInfo.name}
            </p>
          </div>
        </div>

        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 right-0 flex print:hidden">
          <div className="h-1 flex-1 bg-[#1e4a7c]" />
          <div className="h-1 flex-1 bg-white" />
          <div className="h-1 flex-1 bg-[#1e4a7c]" />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 md:flex-row">
        {/* QR Code section */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-40 w-40 items-center justify-center rounded-xl ${
              isPaid ? "bg-white print:border print:border-slate-200" : "bg-white/10 print:bg-slate-100"
            }`}
          >
            {isPaid ? (
              <canvas ref={canvasRef} className="rounded-lg" />
            ) : (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-white/30 print:text-slate-400" />
                <p className="text-xs text-white/50 print:text-slate-500">
                  QR code disponible après confirmation
                </p>
              </div>
            )}
          </div>

          {isPaid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTicket}
              className="mt-3 text-white/70 hover:text-white print:hidden"
            >
              <Download className="mr-2 h-4 w-4" />
              Image QR
            </Button>
          )}
        </div>

        {/* Ticket details */}
        <div className="flex-1">
          {/* Participant name */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50 print:text-slate-500">
                Participant
              </p>
              <h4 className="font-orbitron text-2xl font-bold text-white print:text-slate-900">
                {participant.prenom} {participant.nom}
              </h4>
            </div>

            {participant.is_checked_in && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 print:border-green-600 print:text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Scanné
              </Badge>
            )}
          </div>

          {/* Event details */}
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 print:bg-slate-50 print:border print:border-slate-200">
              <Calendar className="h-4 w-4 text-[#5ba3e0] print:text-slate-600" />
              <span className="text-white/80 print:text-slate-700">{EVENT_INFO.date}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 print:bg-slate-50 print:border print:border-slate-200">
              <Clock className="h-4 w-4 text-[#5ba3e0] print:text-slate-600" />
              <span className="text-white/80 print:text-slate-700">{EVENT_INFO.time}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 print:bg-slate-50 print:border print:border-slate-200">
              <MapPin className="h-4 w-4 text-[#5ba3e0] print:text-slate-600" />
              <span className="text-white/80 print:text-slate-700">{EVENT_INFO.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 print:bg-slate-50 print:border print:border-slate-200">
              <Phone className="h-4 w-4 text-[#5ba3e0] print:text-slate-600" />
              <span className="text-white/80 print:text-slate-700">{EVENT_INFO.phone}</span>
            </div>
          </div>

          {/* Activities */}
          {selectedActivities.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-white/50 print:text-slate-500">
                Activités inscrites
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedActivities.map((activity) => (
                  <Badge
                    key={activity.id}
                    variant="outline"
                    className="border-[#5ba3e0]/30 bg-[#5ba3e0]/10 text-[#5ba3e0] print:border-slate-300 print:text-slate-700 print:bg-white"
                  >
                    {activity.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ticket ID */}
          <div className="border-t border-white/10 pt-3 print:border-slate-200">
            <p className="font-mono text-xs text-white/30 print:text-slate-400">
              ID: {participant.id}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket footer */}
      <div className="flex items-center justify-between border-t border-dashed border-white/10 bg-[#0a1628] px-6 py-3 print:bg-white print:border-slate-300">
        <p className="text-xs text-white/40 print:text-slate-500">
          Présentez ce QR code à l&apos;entrée
        </p>
        <div className="flex items-center gap-2">
          <span className="font-orbitron text-lg font-bold text-[#f0c040] print:text-slate-900">
            {ticketInfo.price.toLocaleString("fr-FR")}
          </span>
          <span className="text-sm text-white/50 print:text-slate-500">FCFA</span>
        </div>
      </div>
    </div>
  )
}