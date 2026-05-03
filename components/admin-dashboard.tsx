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
  Loader2,
  Trash2,
  Plus,
  Copy,
  ExternalLink
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
// Import de deleteOrder
import { updateOrderStatus,createAdminOrder, deleteOrder } from '@/lib/actions'

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTicket, setNewTicket] = useState({
    prenom: '', nom: '', email: '', telephone: '', type_ticket: 'EXPO', payment_method: 'cash', amount: 0
  })

  // Fonction de soumission du formulaire admin
  async function handleCreateManualTicket(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await createAdminOrder(newTicket)
      if (res.success) {
        toast.success("Billet créé et validé avec succès !")
        setIsAddModalOpen(false)
        router.refresh()
        // Optionnel : Copier directement le lien du nouveau billet
        navigator.clipboard.writeText(`${window.location.origin}/ticket/${res.orderId}`)
        toast.info("Lien du ticket copié dans le presse-papier.")
      } else {
        toast.error("Erreur : " + res.error)
      }
    } catch (err) {
      toast.error("Erreur de connexion")
    } finally {
      setIsCreating(false)
    }
  }
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

  // NOUVEAU : Gérer la suppression
  async function handleDeleteOrder(orderId: string) {
    if(!confirm("Attention : Voulez-vous vraiment supprimer définitivement cette commande ?")) return;

    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success("Commande supprimée avec succès.");
        router.refresh();
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    } catch (e) {
      toast.error('Erreur de connexion');
    }
  }

  // NOUVEAU : Copier le lien
  function handleCopyLink(orderId: string) {
    const url = `${window.location.origin}/ticket/${orderId}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien du ticket copié !");
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
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Billet
          </Button>
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
                {/* SÉCURITÉ : Optional Chaining */}
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${info?.color || 'bg-slate-500'}`} />
                <span className="text-sm">{info?.name || type}:</span>
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
                <TableHead>Date & Heure</TableHead>
                <TableHead>Client & Participants</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  {/* DATE & HEURE */}
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(order.created_at || '').toLocaleDateString('fr-FR')} <br/>
                    {new Date(order.created_at || '').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </TableCell>
                  
                  {/* CLIENT & PARTICIPANTS */}
                  <TableCell>
                    <div className="font-medium text-sm mb-1">{order.email || order.buyer_phone}</div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {order.participants?.map(p => (
                        <div key={p.id}>
                          • {p.prenom} {p.nom} ({TICKET_TYPES[p.type_ticket]?.name || p.type_ticket})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  
                  <TableCell className="font-bold">{order.total_amount.toLocaleString('fr-FR')} FCFA</TableCell>
                  
                  <TableCell>
                    <StatusBadge status={order.payment_status} />
                  </TableCell>
                  
                  {/* ACTIONS */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* BOUTON COPIER */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Copier le lien d'accès"
                        onClick={() => handleCopyLink(order.id!)}
                      >
                        <Copy className="w-4 h-4 text-blue-500" />
                      </Button>

                      {/* BOUTON VOIR DETAIL */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Voir les détails"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {/* BOUTONS VALIDER/REJETER */}
                      {order.payment_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600 hover:bg-green-50"
                            title="Confirmer"
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
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Rejeter"
                            onClick={() => handleUpdateStatus(order.id!, 'rejected')}
                            disabled={isUpdating === order.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {/* BOUTON SUPPRIMER */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Supprimer la commande"
                        onClick={() => handleDeleteOrder(order.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              Commande du {selectedOrder && new Date(selectedOrder.created_at || '').toLocaleString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email || 'Non fourni'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone acheteur</p>
                  <p className="font-medium">{selectedOrder.buyer_phone || 'Non fourni'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium">{selectedOrder.total_amount.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <StatusBadge status={selectedOrder.payment_status} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Screenshot</p>
                  {selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url ? (
                    <a 
                      href={selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-flex items-center mt-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-1"/>
                      Voir la capture d'écran
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non fourni (ou cash)</p>
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
                          <p className="text-sm text-muted-foreground">{p.telephone || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* SÉCURITÉ : Optional Chaining pour les couleurs du Dialog */}
                        <Badge className={`${TICKET_TYPES[p.type_ticket]?.color || 'bg-slate-500'} text-white border-0`}>
                          {TICKET_TYPES[p.type_ticket]?.name || p.type_ticket}
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
              {/* NOUVELLE MODALE : Ajout Manuel */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un billet manuellement</DialogTitle>
            <DialogDescription>
              Ce billet sera automatiquement validé. Parfait pour les paiements en cash sur place ou les invités.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManualTicket} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <input title="input" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.prenom} onChange={e => setNewTicket({...newTicket, prenom: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <input title="input" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.nom} onChange={e => setNewTicket({...newTicket, nom: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <input title="input" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.telephone} onChange={e => setNewTicket({...newTicket, telephone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email (Optionnel)</label>
                <input title="input" type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.email} onChange={e => setNewTicket({...newTicket, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de ticket</label>
                <select title="select" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.type_ticket} onChange={e => {
                  const type = e.target.value;
                  // Auto-calcul du prix selon ton TICKET_TYPES
                  const price = TICKET_TYPES[type as keyof typeof TICKET_TYPES]?.price || 0;
                  setNewTicket({...newTicket, type_ticket: type, amount: price})
                }}>
                  {Object.entries(TICKET_TYPES).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant (FCFA)</label>
                <input title="input" type="number" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.amount} onChange={e => setNewTicket({...newTicket, amount: Number(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">Raison / Mode de paiement</label>
               <select title="select"className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTicket.payment_method} onChange={e => setNewTicket({...newTicket, payment_method: e.target.value})}>
                  <option value="cash">Paiement en Cash (Sur place)</option>
                  <option value="vip">Invité VIP / Staff (Gratuit)</option>
                  <option value="wave">Wave (Vérifié manuellement)</option>
                  <option value="orange">Orange Money (Vérifié manuellement)</option>
               </select>
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Générer le billet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
    case 'validated':
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