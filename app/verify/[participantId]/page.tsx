import { notFound } from 'next/navigation'
import { getParticipantById, getOrderWithParticipants } from '@/lib/actions'
import { VerifyTicket } from '@/components/verify-ticket'

interface VerifyPageProps {
  params: Promise<{ participantId: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { participantId } = await params
  
  // 1. Récupération du participant
  const result = await getParticipantById(participantId)
  
  if (!result.success || !result.participant) {
    notFound()
  }
  
  const participant = result.participant
  
  // 2. Récupération de la commande
  const orderResult = await getOrderWithParticipants(participant.order_id!)
  const status = orderResult.order?.payment_status
  const isPaid = status === 'confirmed' || status === 'validated'
  
  return (
    <main className="min-h-screen py-8 px-4 bg-slate-100">
      
      {/* 🚨 ÉCRAN RADAR DE DEBUG SERVEUR 🚨 */}
      <div className="max-w-md mx-auto mb-6 bg-slate-900 text-green-400 p-5 rounded-xl font-mono text-sm shadow-2xl break-all">
        <p className="font-black text-white mb-3 text-lg border-b border-slate-700 pb-2">📡 VUE SERVEUR</p>
        <p><span className="text-slate-400">Participant ID:</span><br/>{participant.id}</p>
        <p className="mt-2"><span className="text-slate-400">Order ID Lié:</span><br/>{participant.order_id || 'NULL (PROBLÈME ICI !)'}</p>
        <p className="mt-2"><span className="text-slate-400">Requête Commande:</span> {orderResult.success ? 'Succès ✅' : 'Échec ❌'}</p>
        <p className="mt-2 font-bold text-yellow-300"><span className="text-slate-400">Statut en Base:</span> "{status}"</p>
        {orderResult.error && <p className="mt-2 text-red-400 font-bold">Erreur : {orderResult.error}</p>}
      </div>

      <VerifyTicket participant={participant} isPaid={isPaid} />
    </main>
  )
}