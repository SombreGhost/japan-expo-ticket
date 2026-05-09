"use client"

import { useEffect, useRef, useState } from "react"
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
  Printer,
  Wifi,
  Database,
  Search,
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

// Palette de couleurs Egghead (plus vives, technologiques)
const eggheadColors = {
  bgDark: "#0a1628", // Bleu nuit
  bgMedium: "#0f2035", // Bleu sombre
  bgLight: "#1e4a7c", // Bleu technologique
  accentYellow: "#f0c040", // Jaune néon
  accentBlue: "#38bdf8", // Bleu néon
  accentRed: "#c41e3a", // Rouge Egghead
  textWhite: "#ffffff",
  textSlate: "#94a3b8",
};

interface TicketDisplayProps {
  order: Order & { participants: Participant[] }
}

export function TicketDisplay({ order }: TicketDisplayProps) {
  const router = useRouter()
  const [time, setTime] = useState(new Date());
  
  // Accepte "validated" ou "confirmed"
  const isPaid = order.payment_status === "validated" || order.payment_status === "confirmed"

  // Effet d'horloge pour l'UI technologique
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="mx-auto max-w-4xl print:max-w-full font-sans text-white">
      {/* Barre d'action utilisateur (Cachée à l'impression) */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 print:hidden">
        <Button onClick={handleCopyLink} variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold rounded-full shadow-lg">
          <Copy className="w-4 h-4 mr-2" /> 
          Sauvegarder le lien du ticket
        </Button>
        {isPaid && (
          <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg border border-white/10">
            <Printer className="w-4 h-4 mr-2" /> 
            Imprimer / Télécharger en PDF
          </Button>
        )}
      </div>

      {/* Header technologique Egghead */}
      <div className="relative mb-8 overflow-hidden rounded-2xl print:hidden border-2 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
        <div className="absolute inset-0">
          <Image
            src="/images/header.jpg" // Image d'Egghead fournie
            alt="Background Egghead"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 to-[#0f2035]/95" />
        </div>

        {/* Effet d'interface holographique */}
       
        <div className="relative z-10 p-10 text-center flex flex-col items-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <h1 className="font-orbitron text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
              JAPAN <span className="text-[#c41e3a]">EXPO</span>
            </h1>
            <p className="text-sm font-bold tracking-widest text-[#f0c040] font-orbitron">{EVENT_INFO.edition}</p>
          </Link>
         
        </div>
      </div>

      {/* Bannière de statut technologique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 flex items-center gap-4 rounded-xl border-2 p-6 print:hidden ${
          isPaid
            ? "border-green-500/50 bg-green-950/20 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
            : "border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
        }`}
      >
        {isPaid ? (
          <>
            <CheckCircle className="h-10 w-10 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
            <div>
              <p className="font-orbitron font-bold text-xl text-green-400  ">Paiement confirmé</p>
              <p className="text-sm text-slate-900 ">
                Vos billets sont prêts! Présentez le QR code à l&apos;entrée.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-10 w-10 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
            <div>
              <p className="font-orbitron font-bold text-xl text-amber-400">
                En attente de confirmation
              </p>
              <p className="text-sm text-slate-300">
                Votre paiement est en cours de vérification. Sauvegardez le lien de cette page et revenez plus tard.
              </p>
            </div>
          </>
        )}
      </motion.div>

      {/* Récapitulatif de la commande (CORRECTION DU CHEVAUCHEMENT) */}
      <div className="mb-8 rounded-xl border border-white/10 bg-[#0f2035] p-6 shadow-lg print:border-slate-300 print:bg-white print:text-black">
        <h2 className="mb-4 font-orbitron text-lg font-bold text-white uppercase print:text-black">
          Récapitulatif
        </h2>
        
        {/* Layout réorganisé pour plus d'espace sur mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-4 text-sm">
          {/* Email sur sa propre ligne complète */}
          <div className="col-span-full border-b pb-4 border-white/10 mb-2">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-wider print:text-black">Email de l&apos;acheteur</p>
            <p className="font-medium text-white print:text-black break-all">{order.buyer_email || 'Non renseigné'}</p>
          </div>
          
          {/* Grille de 3 pour le reste */}
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-full gap-4">
              <div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-wider print:text-black">Total de la commande</p>
                  <p className="font-orbitron font-bold text-[#c41e3a] print:text-black text-lg">
                      {order.total_amount.toLocaleString("fr-FR")} FCFA
                  </p>
              </div>
              <div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-wider print:text-black">ID Commande</p>
                  <p className="font-mono text-xs font-bold text-white bg-white/5 px-2 py-1 rounded inline-block print:text-black print:bg-black/5">{order.id?.slice(0, 8)}</p>
              </div>
              <div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-wider print:text-black">Date</p>
                  <p className="font-medium text-white print:text-black">
                      {new Date(order.created_at || "").toLocaleDateString("fr-FR")}
                  </p>
              </div>
          </div>
        </div>
      </div>

      {/* Cartes de billet */}
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
    <div className="overflow-hidden rounded-2xl bg-[#0f2035] border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.2)] print:border-black print:shadow-none print:bg-white print:text-black">
      {/* En-tête de carte Egghead (Rouge technologique) */}
      <div className="relative bg-gradient-to-r from-[#c41e3a] to-[#a01530] p-6 print:bg-slate-100 print:from-slate-100 print:to-slate-100">
        <div className="absolute inset-0">
          <Image
            src="/images/egghead-bg.png" // Image d'Egghead fournie
            alt="Background Egghead"
            fill
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="font-orbitron text-xs uppercase tracking-wider text-white/70 print:text-slate-500">
              {EVENT_INFO.organizer}
            </p>
            <h3 className="font-orbitron text-2xl font-black text-white print:text-black">
              JAPAN EXPO
            </h3>
          </div>
          <div className="rounded-full bg-white/10 px-6 py-2 backdrop-blur-sm border border-white/20 print:border-slate-300 print:bg-slate-200">
            <p className="font-orbitron text-sm font-bold text-white uppercase tracking-widest print:text-black">
              {ticketInfo.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-8 md:flex-row">
        {/* Section QR Code */}
        <div className="flex flex-col items-center justify-center md:border-r md:border-white/10 md:pr-8 print:border-slate-300 print:bg-white">
          <div className={`flex h-40 w-40 items-center justify-center rounded-xl transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] ${isPaid ? "bg-white p-2 border border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.4)]" : "bg-white/5 border border-dashed border-white/20 print:bg-slate-100"}`}>
            {isPaid ? (
              <canvas ref={canvasRef} className="rounded-lg" />
            ) : (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-amber-500 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                <p className="text-xs text-white/50 print:text-slate-500">QR code disponible après confirmation</p>
              </div>
            )}
          </div>

          {isPaid && (
            <Button variant="ghost" size="sm" onClick={downloadTicket} className="mt-4 text-white/60 hover:text-white hover:bg-white/10 print:hidden w-full font-semibold rounded-full border border-white/10 bg-white/5 shadow-md">
              <Download className="mr-2 h-4 w-4" /> Sauvegarder l&apos;image QR
            </Button>
          )}
        </div>

        {/* Détails du billet */}
        <div className="flex-1">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 print:text-slate-500 mb-1">
                Détenteur du billet
              </p>
              <h4 className="font-orbitron text-3xl font-black uppercase text-white print:text-black">
                {participant.prenom} {participant.nom}
              </h4>
            </div>

            {participant.is_checked_in && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 print:border-green-600 print:text-green-700 py-2 px-4 rounded-full font-bold shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                <CheckCircle className="mr-2 h-4 w-4" /> Scanné
              </Badge>
            )}
          </div>

          {/* Grille d'informations avec icônes néon */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm font-mono">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 print:bg-slate-50 print:border border-white/5">
              <Calendar className="h-5 w-5 text-[#38bdf8] drop-shadow-[0_0_3px_rgba(56,189,248,0.7)]" />
              <span className="text-white font-medium print:text-black">{EVENT_INFO.date}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 print:bg-slate-50 print:border border-white/5">
              <Clock className="h-5 w-5 text-[#f0c040] drop-shadow-[0_0_3px_rgba(240,192,64,0.7)]" />
              <span className="text-white font-medium print:text-black">{EVENT_INFO.time}</span>
            </div>
            
            {/* LIEN MAPS CLIQUABLE */}
            <a href={`https://maps.google.com/?q=$${encodeURIComponent(EVENT_INFO.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer border-white/5 print:bg-slate-50 print:border hover:border-blue-500/30">
              <MapPin className="h-5 w-5 text-[#c41e3a] drop-shadow-[0_0_3px_rgba(196,30,58,0.7)]" />
              <span className="text-[#38bdf8] hover:underline font-medium print:text-black">{EVENT_INFO.location}</span>
            </a>
            
            {/* LIEN TÉLÉPHONE CLIQUABLE */}
            <a href={`tel:${EVENT_INFO.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer border-white/5 print:bg-slate-50 print:border hover:border-blue-500/30">
              <Phone className="h-5 w-5 text-[#38bdf8] drop-shadow-[0_0_3px_rgba(56,189,248,0.7)]" />
              <span className="text-[#38bdf8] hover:underline font-medium print:text-black">{EVENT_INFO.phone}</span>
            </a>
          </div>

          {/* Activités incluses */}
          {selectedActivities.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50 print:text-slate-500">
                Activités incluses
              </p>
              <div className="flex flex-wrap gap-2.5">
                {selectedActivities.map((activity) => (
                  <Badge key={activity.id} className="bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] px-4 py-2 font-medium rounded-full print:border-slate-300 print:text-black print:bg-black/5 shadow-md">
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