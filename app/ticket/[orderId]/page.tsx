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
    <main className="relative min-h-screen py-12 px-4 bg-slate-50 font-sans text-slate-900">
      {/* Background Egghead abstrait */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/80 to-slate-50" />
      </div>
      
      <div className="relative z-10">
        <TicketDisplay order={result.order} />
      </div>
    </main>
  )
}