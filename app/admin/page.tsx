import { getStats, getAllOrders } from '@/lib/actions'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [statsResult, ordersResult] = await Promise.all([
    getStats(),
    getAllOrders()
  ])
  
  return (
    <main className="relative min-h-screen py-8 px-4 bg-slate-50">
      {/* Background Egghead */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminDashboard 
          initialStats={statsResult.stats} 
          initialOrders={ordersResult.orders || []}
        />
      </div>
    </main>
  )
}