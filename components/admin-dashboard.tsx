'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, Users, Ticket, CheckCircle, Clock, XCircle,
  Eye, Check, X, QrCode, RefreshCw, Loader2, Trash2, Plus, Copy, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

import { Order, Participant, TICKET_TYPES, EVENT_INFO } from '@/lib/types'
import { updateOrderStatus, createAdminOrder, deleteOrder } from '@/lib/actions'

interface AdminDashboardProps {
  initialStats?: any
  initialOrders: (Order & { participants: Participant[] })[]
}

export function AdminDashboard({ initialStats, initialOrders }: AdminDashboardProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<(Order & { participants: Participant[] }) | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  // States Modale Ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTicket, setNewTicket] = useState({
    prenom: '', nom: '', email: '', telephone: '', type_ticket: 'EXPO', payment_method: 'cash', amount: 1000
  })
  
  const stats = initialStats || {
    totalOrders: 0, confirmedOrders: 0, pendingOrders: 0, totalParticipants: 0,
    checkedInParticipants: 0, totalRevenue: 0, ticketsByType: {}
  }

  // --- SONDE REALTIME ---
  useEffect(() => {
    const supabase = createClient()
    console.log("🔌 Initialisation du Realtime...")
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log("🔥 EVENEMENT REALTIME REÇU :", payload)
        toast.info("Mise à jour en direct ! (" + payload.eventType + ")")
        router.refresh()
      })
      .subscribe((status) => {
        console.log("📶 Statut de connexion Realtime :", status)
      })

    return () => { supabase.removeChannel(channel) }
  }, [router])
  
  async function handleUpdateStatus(orderId: string, status: 'confirmed' | 'rejected') {
    setIsUpdating(orderId)
    try {
      const result = await updateOrderStatus(orderId, status)
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: status === 'confirmed' ? 'validated' : status } : o))
        toast.success(`Commande ${status === 'confirmed' ? 'confirmée' : 'rejetée'}`)
        router.refresh()
      } else {
        toast.error("Erreur MAJ: " + result.error)
      }
    } catch (error) { toast.error('Erreur réseau') } 
    finally { setIsUpdating(null) }
  }

  // --- SONDE SUPPRESSION ---
  async function handleDeleteOrder(orderId: string) {
    if(!confirm("Attention : Voulez-vous supprimer définitivement cette commande et tous ses participants ?")) return;
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success("Commande supprimée !");
        router.refresh();
      } else {
        console.error("Erreur serveur retournée:", result.error)
        toast.error("Échec: " + result.error);
      }
    } catch (e: any) { toast.error('Erreur : ' + e.message); }
  }

  // --- SONDE CRÉATION ---
  async function handleCreateManualTicket(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    try {
      console.log("Envoi du formulaire admin avec:", newTicket)
      const res = await createAdminOrder(newTicket)
      if (res.success) {
        toast.success("Billet créé avec succès !")
        setIsAddModalOpen(false)
        router.refresh()
      } else {
        console.error("Erreur création retournée:", res.error)
        toast.error("Erreur : " + res.error)
      }
    } catch (err: any) { toast.error("Erreur crash: " + err.message) } 
    finally { setIsCreating(false) }
  }

  function handleCopyLink(orderId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/ticket/${orderId}`);
    toast.success("Lien copié !");
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-orbitron text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">{EVENT_INFO.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Nouveau
          </Button>
          <Link href="/admin/scan">
            <Button variant="outline"><QrCode className="w-4 h-4 mr-2" /> Scanner</Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => router.refresh()}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Ticket className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.totalOrders}</p><p className="text-sm text-muted-foreground">Commandes</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-bold">{stats.confirmedOrders}</p><p className="text-sm text-muted-foreground">Confirmées</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center"><Users className="w-5 h-5 text-secondary" /></div><div><p className="text-2xl font-bold">{stats.totalParticipants}</p><p className="text-sm text-muted-foreground">Participants</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-accent" /></div><div><p className="text-2xl font-bold">{stats.totalRevenue?.toLocaleString('fr-FR')}</p><p className="text-sm text-muted-foreground">FCFA (confirmé)</p></div></div></CardContent></Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commandes récentes</CardTitle>
          <CardDescription>{stats.pendingOrders} commande(s) en attente</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{new Date(order.created_at || '').toLocaleDateString('fr-FR')} <br/>{new Date(order.created_at || '').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</TableCell>
                  <TableCell><div className="font-medium text-sm mb-1">{order.email || order.buyer_phone}</div><div className="flex flex-col gap-1 text-xs text-muted-foreground">{order.participants?.map(p => (<div key={p.id}>• {p.prenom} {p.nom} <span className="font-bold">({TICKET_TYPES[p.type_ticket]?.name || p.type_ticket})</span></div>))}</div></TableCell>
                  <TableCell className="font-bold">{order.total_amount.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell><StatusBadge status={order.payment_status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleCopyLink(order.id!)}><Copy className="w-4 h-4 text-blue-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button>
                      {order.payment_status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleUpdateStatus(order.id!, 'confirmed')} disabled={isUpdating === order.id}>{isUpdating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleUpdateStatus(order.id!, 'rejected')} disabled={isUpdating === order.id}><X className="w-4 h-4" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => handleDeleteOrder(order.id!)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modale Voir Ticket */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Détails de la commande</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Téléphone</p><p className="font-medium">{selectedOrder.buyer_phone || 'Non fourni'}</p></div>
                <div><p className="text-sm text-muted-foreground">Montant</p><p className="font-medium">{selectedOrder.total_amount.toLocaleString('fr-FR')} FCFA</p></div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Screenshot</p>
                  {selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url ? (
                    <a href={selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url} target="_blank" className="text-blue-500 hover:underline inline-flex"><ExternalLink className="w-4 h-4 mr-1"/> Voir reçu</a>
                  ) : <p className="text-sm text-muted-foreground">Non fourni (ou cash)</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale Ajout Manuel */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Billet Manuel (Immédiatement validé)</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateManualTicket} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Prénom</label><input title="in" required className="flex h-10 w-full rounded-md border border-input px-3" value={newTicket.prenom} onChange={e => setNewTicket({...newTicket, prenom: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Nom</label><input title="in" required className="flex h-10 w-full rounded-md border border-input px-3" value={newTicket.nom} onChange={e => setNewTicket({...newTicket, nom: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Téléphone</label><input title="in" required className="flex h-10 w-full rounded-md border border-input px-3" value={newTicket.telephone} onChange={e => setNewTicket({...newTicket, telephone: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Type ticket</label>
                <select title="f" className="flex h-10 w-full rounded-md border border-input px-3" value={newTicket.type_ticket} onChange={e => setNewTicket({...newTicket, type_ticket: e.target.value, amount: TICKET_TYPES[e.target.value as keyof typeof TICKET_TYPES]?.price || 0})}>
                  {Object.entries(TICKET_TYPES).map(([key, info]) => <option key={key} value={key}>{info.name}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Créer Billet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if(status === 'confirmed' || status === 'validated') return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Confirmé</Badge>
  if(status === 'rejected') return <Badge className="bg-red-500/20 text-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>
  return <Badge className="bg-amber-500/20 text-amber-500"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
}