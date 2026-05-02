import { notFound } from 'next/navigation'
import { getOrderWithParticipants } from '@/lib/actions'
import { TicketDisplay } from '@/components/ticket-display'

interface TicketPageProps {
  params: Promise<{ orderId: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { orderId } = await params
  const result = await getOrderWithParticipants(orderId)
  
  if (!result.success || !result.order) {
    notFound()
  }
  
  return (
    <main className="min-h-screen py-8 px-4">
      <TicketDisplay order={result.order} />
    </main>
  )
}
