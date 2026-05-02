'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Ticket, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Check,
  X,
  QrCode,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Order, Participant, TICKET_TYPES, EVENT_INFO } from '@/lib/types'
import { updateOrderStatus } from '@/lib/actions'

interface AdminDashboardProps {
  initialStats?: {
    totalOrders: number
    confirmedOrders: number
    pendingOrders: number
    totalParticipants: number
    checkedInParticipants: number
    totalRevenue: number
    ticketsByType: Record<string, number>
  }
  initialOrders: (Order & { participants: Participant[] })[]
}

export function AdminDashboard({ initialStats, initialOrders }: AdminDashboardProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<(Order & { participants: Participant[] }) | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  const stats = initialStats || {
    totalOrders: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
    totalParticipants: 0,
    checkedInParticipants: 0,
    totalRevenue: 0,
    ticketsByType: {}
  }
  
  async function handleUpdateStatus(orderId: string, status: 'confirmed' | 'rejected') {
    setIsUpdating(orderId)
    
    try {
      const result = await updateOrderStatus(orderId, status)
      
      if (result.success) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, payment_status: status } : o
        ))
        toast.success(`Commande ${status === 'confirmed' ? 'confirmée' : 'rejetée'}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsUpdating(null)
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-orbitron text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">{EVENT_INFO.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/scan">
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Scanner
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => router.refresh()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmedOrders}</p>
                <p className="text-sm text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-muted-foreground">FCFA (confirmé)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Ticket types breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Répartition des billets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(TICKET_TYPES).map(([type, info]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${info.color}`} />
                <span className="text-sm">{info.name}:</span>
                <span className="font-bold">{stats.ticketsByType[type] || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commandes récentes</CardTitle>
          <CardDescription>
            {stats.pendingOrders} commande(s) en attente de validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.email}</TableCell>
                  <TableCell>{order.participants?.length || 0}</TableCell>
                  <TableCell>{order.total_amount.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>
                    <StatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at || '').toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {order.payment_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleUpdateStatus(order.id!, 'confirmed')}
                            disabled={isUpdating === order.id}
                          >
                            {isUpdating === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleUpdateStatus(order.id!, 'rejected')}
                            disabled={isUpdating === order.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune commande pour le moment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              Commande du {selectedOrder && new Date(selectedOrder.created_at || '').toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium">{selectedOrder.total_amount.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <StatusBadge status={selectedOrder.payment_status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Screenshot</p>
                  {selectedOrder.payment_screenshot_url ? (
                    <a 
                      href={selectedOrder.payment_screenshot_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Voir la capture
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non fourni</p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Participants</p>
                <div className="space-y-2">
                  {selectedOrder.participants?.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{p.prenom} {p.nom}</p>
                          <p className="text-sm text-muted-foreground">{p.telephone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`bg-gradient-to-r ${TICKET_TYPES[p.type_ticket].color} text-white border-0`}>
                          {TICKET_TYPES[p.type_ticket].name}
                        </Badge>
                        {p.is_checked_in && (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            Scanné
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.payment_status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id!, 'confirmed')
                      setSelectedOrder(null)
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer le paiement
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id!, 'rejected')
                      setSelectedOrder(null)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmé
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Rejeté
        </Badge>
      )
    default:
      return (
        <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      )
  }
}
