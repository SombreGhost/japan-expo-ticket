import { getOrderWithParticipants } from '@/lib/actions'
import { TicketDisplay } from '@/components/ticket-display'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TicketPageProps {
  params: Promise<{ orderId: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { orderId } = await params
  const result = await getOrderWithParticipants(orderId)
  
  // SÉCURITÉ : Gérer les tickets invalides
  if (!result.success || !result.order) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white border border-red-200 shadow-2xl p-10 rounded-[2rem] text-center max-w-md w-full">
          <div className="mx-auto bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black font-outfit uppercase text-slate-900 mb-3">
            Ticket Invalide
          </h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Ce lien de réservation n'existe pas ou a été supprimé. Assurez-vous d'avoir utilisé le lien exact fourni lors de votre commande.
          </p>
          <Link href="/">
            <Button className="w-full h-14 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold uppercase tracking-wider">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    )
  }
  
  return (
    <main className="relative min-h-screen py-12 px-4 bg-slate-50 font-sans text-slate-900">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/80 to-slate-50" />
      </div>
      
      <div className="relative z-10">
        <TicketDisplay order={result.order} />
      </div>
    </main>
  )
}