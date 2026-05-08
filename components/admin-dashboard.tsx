'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, Users, Ticket, CheckCircle, Clock, XCircle,
  Eye, Check, X, QrCode, RefreshCw, Loader2, Trash2, Plus, Copy, ExternalLink,
  Search, Filter, Receipt, Phone, Mail, Calendar, UserCheck
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
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
  
  // Filtres et Recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all')

  // States Modale Ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])
  
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
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success("🔔 NOUVELLE COMMANDE REÇUE !", {
            description: "Une nouvelle commande est en attente de validation.",
            duration: 10000,
            action: { label: "Voir", onClick: () => window.scrollTo(0, 500) }
          })
        }
        router.refresh()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])
  
  // --- LOGIQUE DE FILTRAGE ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtre de statut (attention au 'validated' qui équivaut à 'confirmed' dans la logique admin)
      const orderStatus = order.payment_status === 'validated' ? 'confirmed' : order.payment_status
      const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter

      // Filtre de recherche
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        (order.email?.toLowerCase().includes(searchLower)) ||
        (order.buyer_phone?.toLowerCase().includes(searchLower)) ||
        (order.participants?.some(p => 
          p.nom.toLowerCase().includes(searchLower) || 
          p.prenom.toLowerCase().includes(searchLower)
        ))

      return matchesStatus && matchesSearch
    }).sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
  }, [orders, statusFilter, searchTerm])

  async function handleUpdateStatus(orderId: string, status: 'confirmed' | 'rejected') {
    setIsUpdating(orderId)
    try {
      const result = await updateOrderStatus(orderId, status)
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: status === 'confirmed' ? 'validated' : status } : o))
        toast.success(`Commande ${status === 'confirmed' ? 'confirmée et billets envoyés !' : 'rejetée'}`)
        router.refresh()
      } else {
        toast.error("Erreur MAJ: " + result.error)
      }
    } catch (error) { toast.error('Erreur réseau') } 
    finally { setIsUpdating(null); setSelectedOrder(null); }
  }

  async function handleDeleteOrder(orderId: string) {
    if(!confirm("⚠️ Action irréversible : Voulez-vous supprimer définitivement cette commande et annuler ces billets ?")) return;
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success("Commande supprimée !");
        router.refresh();
      } else {
        toast.error("Échec: " + result.error);
      }
    } catch (e: any) { toast.error('Erreur : ' + e.message); }
  }

  async function handleCreateManualTicket(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await createAdminOrder(newTicket)
      if (res.success) {
        toast.success("Billet manuel généré avec succès !")
        setIsAddModalOpen(false)
        setNewTicket({ prenom: '', nom: '', email: '', telephone: '', type_ticket: 'EXPO', payment_method: 'cash', amount: 1000 })
        router.refresh()
      } else {
        toast.error("Erreur : " + res.error)
      }
    } catch (err: any) { toast.error("Erreur système: " + err.message) } 
    finally { setIsCreating(false) }
  }

  function handleCopyLink(orderId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/ticket/${orderId}`);
    toast.success("Lien du billet copié !");
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-black uppercase text-slate-900 tracking-tight">QG <span className="text-blue-600">Admin</span></h1>
          <p className="text-slate-500 font-medium">{EVENT_INFO.name} - Gestion des entrées</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" /> Entrée Rapide
          </Button>
          <Link href="/admin/scan">
            <Button variant="outline" className="rounded-full border-slate-200 hover:bg-blue-50 hover:text-blue-600">
              <QrCode className="w-4 h-4 mr-2" /> Scanner QR
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.refresh()}>
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"><Receipt className="w-6 h-6 text-slate-600" /></div><div><p className="text-3xl font-black text-slate-900">{stats.totalOrders}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commandes</p></div></div></CardContent></Card>
        <Card className="border-none shadow-sm bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center"><Clock className="w-6 h-6 text-amber-500" /></div><div><p className="text-3xl font-black text-amber-600">{stats.pendingOrders}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En attente</p></div></div></CardContent></Card>
        <Card className="border-none shadow-sm bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div><div><p className="text-3xl font-black text-blue-600">{stats.totalParticipants}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inscrits</p></div></div></CardContent></Card>
        <Card className="border-none shadow-sm bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-green-600" /></div><div><p className="text-3xl font-black text-green-600">{stats.totalRevenue?.toLocaleString('fr-FR')}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">FCFA validés</p></div></div></CardContent></Card>
      </div>
      
      {/* Table Section */}
      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Registre des commandes</CardTitle>
              <CardDescription>Gérez les validations et les accès participants</CardDescription>
            </div>
            
            {/* Outils de filtre */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nom, tel, email..." 
                  className="pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
              title="Filtrer par statut de paiement"
                className="py-2 pl-3 pr-8 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Validés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold">Acheteur</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">Billets</TableHead>
                  <TableHead className="font-bold text-right">Montant</TableHead>
                  <TableHead className="font-bold text-center">Statut</TableHead>
                  <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-slate-50/80 transition-colors">
                    {/* Colonne Acheteur */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{order.buyer_phone || 'N/A'}</div>
                          {order.email && <div className="text-xs text-slate-500">{order.email}</div>}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {new Date(order.created_at || '').toLocaleDateString('fr-FR')} - {new Date(order.created_at || '').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Colonne Billets */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {order.participants?.map((p, i) => (
                          <Badge key={p.id} variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                            {p.prenom} {p.nom.charAt(0)}. ({TICKET_TYPES[p.type_ticket]?.name || p.type_ticket})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Colonne Montant */}
                    <TableCell className="text-right">
                      <div className="font-black text-slate-900">{order.total_amount.toLocaleString('fr-FR')} <span className="text-xs text-slate-500 font-normal">FCFA</span></div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{order.payment_method}</div>
                    </TableCell>

                    {/* Colonne Statut */}
                    <TableCell className="text-center">
                      <StatusBadge status={order.payment_status} />
                    </TableCell>

                    {/* Colonne Actions */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-200 text-slate-600" onClick={() => setSelectedOrder(order)} title="Voir les détails">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-100 text-blue-600" onClick={() => handleCopyLink(order.id!)} title="Copier le lien du billet">
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        {order.payment_status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" className="hover:bg-green-100 text-green-600" onClick={() => handleUpdateStatus(order.id!, 'confirmed')} disabled={isUpdating === order.id} title="Valider le paiement">
                              {isUpdating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-100 text-red-500" onClick={() => handleUpdateStatus(order.id!, 'rejected')} disabled={isUpdating === order.id} title="Rejeter la commande">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="hover:bg-red-100 text-red-400 hover:text-red-600" onClick={() => handleDeleteOrder(order.id!)} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* MODALE DÉTAILS DE LA COMMANDE (Améliorée) */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-0 overflow-hidden border-0">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* En-tête de la modale */}
              <div className="bg-slate-900 text-white p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider mb-1">Commande</h2>
                    <p className="text-slate-400 font-mono text-sm opacity-80">{selectedOrder.id}</p>
                  </div>
                  <StatusBadge status={selectedOrder.payment_status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Montant</p>
                    <p className="text-xl font-bold">{selectedOrder.total_amount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Méthode</p>
                    <p className="text-lg font-medium capitalize flex items-center"><Receipt className="w-4 h-4 mr-2 opacity-50"/> {selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Contact</p>
                    <p className="text-lg font-medium flex items-center"><Phone className="w-4 h-4 mr-2 opacity-50"/> {selectedOrder.buyer_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Date</p>
                    <p className="text-sm font-medium flex items-center"><Calendar className="w-4 h-4 mr-2 opacity-50"/> {new Date(selectedOrder.created_at || '').toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Contenu de la modale */}
              <div className="p-6 md:p-8 bg-slate-50 space-y-8">
                
                {/* Preuve de paiement */}
                {(selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url) && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Preuve de paiement</p>
                        <p className="text-xs text-slate-500">Capture d'écran fournie par le client</p>
                      </div>
                    </div>
                    <a href={selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-colors inline-flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2"/> Voir l'image
                    </a>
                  </div>
                )}

                {/* Liste des participants */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-slate-400" /> Participants liés ({selectedOrder.participants?.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.participants?.map((p, idx) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold font-mono text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{p.prenom} {p.nom}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-slate-500 flex items-center"><Phone className="w-3 h-3 mr-1"/> {p.telephone}</p>
                              {selectedOrder.email && <p className="text-xs text-slate-500 flex items-center"><Mail className="w-3 h-3 mr-1"/> {selectedOrder.email}</p>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:justify-end">
                          <Badge className="bg-slate-900 text-white font-bold px-3 py-1 border-0">
                            {TICKET_TYPES[p.type_ticket]?.name || p.type_ticket}
                          </Badge>
                          {p.is_checked_in ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> Scanné
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200">
                              <Clock className="w-3 h-3 mr-1" /> Non scanné
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions de la modale */}
              {selectedOrder.payment_status === 'pending' && (
                <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-3 justify-end rounded-b-[2rem]">
                  <Button variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleUpdateStatus(selectedOrder.id!, 'rejected')} disabled={isUpdating === selectedOrder.id}>
                    Rejeter le paiement
                  </Button>
                  <Button className="rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(selectedOrder.id!, 'confirmed')} disabled={isUpdating === selectedOrder.id}>
                    {isUpdating === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Valider & Envoyer les billets
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale Ajout Manuel (Améliorée) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">Entrée Rapide</DialogTitle>
            <DialogDescription>Génère un billet instantanément validé (Paiement cash sur place, invités VIP, etc.)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateManualTicket} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Prénom</label>
                <input required className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-900 focus:outline-none" value={newTicket.prenom} onChange={e => setNewTicket({...newTicket, prenom: e.target.value})} placeholder="Ex: Jean" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nom</label>
                <input required className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-900 focus:outline-none" value={newTicket.nom} onChange={e => setNewTicket({...newTicket, nom: e.target.value})} placeholder="Ex: Dupont" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Téléphone</label>
              <input required type="tel" className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-900 focus:outline-none" value={newTicket.telephone} onChange={e => setNewTicket({...newTicket, telephone: e.target.value})} placeholder="Numéro de contact" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Type de billet</label>
              <select title="Type de billet" className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium" value={newTicket.type_ticket} onChange={e => setNewTicket({...newTicket, type_ticket: e.target.value, amount: TICKET_TYPES[e.target.value as keyof typeof TICKET_TYPES]?.price || 0})}>
                {Object.entries(TICKET_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>{info.name} - {info.price} FCFA</option>
                ))}
              </select>
            </div>
            
            <Button type="submit" className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg mt-4" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />} 
              Générer le Billet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if(status === 'confirmed' || status === 'validated') return <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 font-bold uppercase text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> Validé</Badge>
  if(status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1 font-bold uppercase text-[10px]"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>
  return <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 font-bold uppercase text-[10px]"><Clock className="w-3 h-3 mr-1 animate-pulse" /> Attente</Badge>
}