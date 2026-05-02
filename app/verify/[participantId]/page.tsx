import { notFound } from 'next/navigation'
import { getParticipantById, getOrderWithParticipants } from '@/lib/actions'
import { VerifyTicket } from '@/components/verify-ticket'

interface VerifyPageProps {
  params: Promise<{ participantId: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { participantId } = await params
  const result = await getParticipantById(participantId)
  
  if (!result.success || !result.participant) {
    notFound()
  }
  
  const participant = result.participant
  
  // Get order to check payment status
  const orderResult = await getOrderWithParticipants(participant.order_id!)
  const isPaid = orderResult.order?.payment_status === 'confirmed'
  
  return (
    <main className="min-h-screen py-8 px-4">
      <VerifyTicket participant={participant} isPaid={isPaid} />
    </main>
  )
}
