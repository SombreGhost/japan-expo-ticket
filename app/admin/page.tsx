import { getStats, getAllOrders } from '@/lib/actions'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [statsResult, ordersResult] = await Promise.all([
    getStats(),
    getAllOrders()
  ])
  
  return (
    <main className="min-h-screen py-8 px-4">
      <AdminDashboard 
        initialStats={statsResult.stats} 
        initialOrders={ordersResult.orders || []}
      />
    </main>
  )
}
