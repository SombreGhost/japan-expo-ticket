'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, Users, Ticket, CheckCircle, Clock, XCircle,
  Eye, Check, X, QrCode, RefreshCw, Loader2, Trash2, Plus, Copy, ExternalLink,
  Search, Receipt, Phone, Mail, Calendar, UserCheck,FileSpreadsheet, BookOpen, FileDown
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
      const orderStatus = order.payment_status === 'validated' ? 'confirmed' : order.payment_status
      const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter

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
        toast.success(`Commande ${status === 'confirmed' ? 'confirmée' : 'rejetée'}`)
        router.refresh()
      } else {
        toast.error("Erreur MAJ: " + result.error)
      }
    } catch (error) { toast.error('Erreur réseau') } 
    finally { setIsUpdating(null); setSelectedOrder(null); }
  }

  async function handleDeleteOrder(orderId: string) {
    if(!confirm("⚠️ Action irréversible : Voulez-vous supprimer définitivement cette commande ?")) return;
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
  const exportToCSV = () => {
  // Préparation des données : une ligne par participant pour être précis
  const rows = filteredOrders.flatMap(order => 
    order.participants.map(p => ({
      Date: new Date(order.created_at || '').toLocaleDateString('fr-FR'),
      Heure: new Date(order.created_at || '').toLocaleTimeString('fr-FR'),
      Acheteur_Tel: order.buyer_phone || '',
      Acheteur_Email: order.email || '',
      Participant_Nom: `${p.prenom} ${p.nom}`,
      Type_Billet: TICKET_TYPES[p.type_ticket]?.name || p.type_ticket,
      Montant_Ligne: (order.total_amount / order.participants.length).toFixed(0),
      Methode: order.payment_method,
      Statut: order.payment_status,
      ID_Commande: order.id
    }))
  );

  if (rows.length === 0) return toast.error("Aucune donnée à exporter");

  // Création du contenu CSV
  const header = Object.keys(rows[0]).join(",");
  const csvContent = [
    header,
    ...rows.map(row => Object.values(row).map(value => `"${value}"`).join(","))
  ].join("\n");

  // Téléchargement du fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `export_billetterie_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("Export Excel (CSV) prêt !");
};
  
  return (
    // MODIFICATION 1 : Fond de page assombri pour le contraste (bg-slate-100)
    <div className="max-w-7xl mx-auto space-y-8 bg-slate-100 p-4 sm:p-6 rounded-[2rem]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-black uppercase text-slate-950 tracking-tight">QG <span className="text-blue-600">Admin</span></h1>
          <p className="text-slate-600 font-medium">{EVENT_INFO.name} - Gestion des entrées</p>
        </div>
       <div className="flex flex-wrap items-center gap-3">
        {/* Nouveau bouton Guide */}
        <Link href="/admin/guide">
          <Button variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-50 text-slate-700">
            <BookOpen className="w-4 h-4 mr-2" /> Guide
          </Button>
        </Link>

        {/* Nouveau bouton Export */}
        <Button 
          onClick={exportToCSV}
          variant="outline" 
          className="text-slate-700 rounded-full border-slate-300 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
        </Button>

        <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" /> Entrée Rapide
        </Button>
        
        <Link href="/admin/scan">
          <Button variant="outline" className="text-slate-700 rounded-full border-slate-300 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all">
            <QrCode className="w-4 h-4 mr-2" /> Scanner QR
          </Button>
        </Link>
</div>
      </div>
      
      {/* Stats Grid - MODIFICATION 2 : Cartes blanches sur fond gris, plus ombrées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-white rounded-3xl"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-slate-200/70 flex items-center justify-center"><Receipt className="w-6 h-6 text-slate-700" /></div><div><p className="text-3xl font-black text-slate-950">{stats.totalOrders}</p><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commandes</p></div></div></CardContent></Card>
        <Card className="border-none shadow-md bg-white rounded-3xl"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div><div><p className="text-3xl font-black text-amber-600">{stats.pendingOrders}</p><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">En attente</p></div></div></CardContent></Card>
        <Card className="border-none shadow-md bg-white rounded-3xl"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center"><Users className="w-6 h-6 text-blue-700" /></div><div><p className="text-3xl font-black text-blue-700">{stats.totalParticipants}</p><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscrits</p></div></div></CardContent></Card>
        <Card className="border-none shadow-md bg-white rounded-3xl"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-green-700" /></div><div><p className="text-3xl font-black text-green-700">{stats.totalRevenue?.toLocaleString('fr-FR')}</p><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">FCFA validés</p></div></div></CardContent></Card>
      </div>
      
      {/* Table Section - MODIFICATION 3 : Card plus ombrée (shadow-2xl) */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-slate-50/80 border-b border-slate-200 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-950">Registre des commandes</CardTitle>
              <CardDescription className="text-slate-600">Gérez les validations et les accès participants</CardDescription>
            </div>
            
            {/* Outils de filtre - MODIFICATION 4 : Bords des inputs plus sombres (border-slate-300) */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nom, tel, email..." 
                  className="pl-9 pr-4 py-2.5 text-sm rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 w-full md:w-[220px] bg-white text-slate-950 placeholder:text-slate-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
              title='idk'
                className="py-2.5 pl-4 pr-10 text-sm rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white aspect-auto font-medium text-slate-950 cursor-pointer transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">🟠 En attente</option>
                <option value="confirmed">🟢 Validés</option>
                <option value="rejected">🔴 Rejetés</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* MODIFICATION 5 : Header du tableau plus gris (bg-slate-100) */}
              <TableHeader className="bg-slate-100 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-800">Acheteur</TableHead>
                  <TableHead className="font-bold text-slate-800 hidden md:table-cell">Billets</TableHead>
                  <TableHead className="font-bold text-slate-800 text-right">Montant</TableHead>
                  <TableHead className="font-bold text-slate-800 text-center">Statut</TableHead>
                  <TableHead className="text-right font-bold text-slate-800 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500 bg-slate-50/50">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-blue-50/50 transition-colors border-b border-slate-100">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          <UserCheck className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-950">{order.buyer_phone || 'N/A'}</div>
                          {order.email && <div className="text-xs text-slate-600 font-medium">{order.email}</div>}
                          <div className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                            {new Date(order.created_at || '').toLocaleDateString('fr-FR')} - {new Date(order.created_at || '').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {order.participants?.map((p) => (
                          <Badge key={p.id} variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-full">
                            {p.prenom} {p.nom.charAt(0)}. ({TICKET_TYPES[p.type_ticket]?.name || p.type_ticket})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="font-black text-lg text-slate-950">{order.total_amount.toLocaleString('fr-FR')} <span className="text-xs text-slate-600 font-bold">FCFA</span></div>
                      <div className="text-[11px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{order.payment_method}</div>
                    </TableCell>

                    <TableCell className="text-center py-4">
                      <StatusBadge status={order.payment_status} />
                    </TableCell>

                    <TableCell className="text-right pr-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="hover:bg-blue-100 text-blue-600 rounded-full w-9 h-9" onClick={() => setSelectedOrder(order)} title="Voir les détails">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-slate-200 text-slate-700 rounded-full w-9 h-9" onClick={() => handleCopyLink(order.id!)} title="Copier le lien du billet">
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        {order.payment_status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" className="hover:bg-green-100 text-green-700 rounded-full w-9 h-9" onClick={() => handleUpdateStatus(order.id!, 'confirmed')} disabled={isUpdating === order.id} title="Valider le paiement">
                              {isUpdating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-100 text-red-600 rounded-full w-9 h-9" onClick={() => handleUpdateStatus(order.id!, 'rejected')} disabled={isUpdating === order.id} title="Rejeter la commande">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full w-9 h-9" onClick={() => handleDeleteOrder(order.id!)} title="Supprimer définitivement">
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
      
      {/* MODALE DÉTAILS DE LA COMMANDE */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        {/* MODIFICATION 6 : DialogContent sans bordure et plus ombré */}
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-3xl bg-white">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* En-tête de la modale - Fond Bleu Nuit */}
              <div className="bg-[#0f2035] text-white p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-wider mb-2 font-orbitron">Commande</h2>
                    <p className="text-slate-300 font-mono text-sm bg-black/30 px-3 py-1 rounded-md inline-block">{selectedOrder.id}</p>
                  </div>
                  <StatusBadge status={selectedOrder.payment_status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1.5 tracking-wide">Montant Total</p>
                    <p className="text-2xl font-black text-[#f0c040]">{selectedOrder.total_amount.toLocaleString('fr-FR')} <span className="text-xs font-normal text-white/70">FCFA</span></p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1.5 tracking-wide">Méthode</p>
                    <p className="text-lg font-bold capitalize flex items-center text-white"><Receipt className="w-5 h-5 mr-2 text-blue-400"/> {selectedOrder.payment_method}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1.5 tracking-wide">Contact Acheteur</p>
                    <p className="text-lg font-bold flex items-center text-white"><Phone className="w-5 h-5 mr-2 text-blue-400"/> {selectedOrder.buyer_phone}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1.5 tracking-wide">Date d'achat</p>
                    <p className="text-sm font-bold flex items-center text-white"><Calendar className="w-5 h-5 mr-2 text-blue-400"/> {new Date(selectedOrder.created_at || '').toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Contenu de la modale - MODIFICATION 7 : bg-slate-100 pour contraster avec les sous-cartes */}
              <div className="p-8 md:p-10 bg-slate-100 space-y-10">
                
                {/* Preuve de paiement */}
                {(selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url) && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center border border-blue-200">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-slate-950">Vérification du Paiement</p>
                        <p className="text-sm text-slate-600">Capture d'écran de la transaction fournie par le client</p>
                      </div>
                    </div>
                    <a href={selectedOrder.payment_screenshot_url || selectedOrder.payment_proof_url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-slate-950 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-colors inline-flex items-center shadow-lg">
                      <ExternalLink className="w-4 h-4 mr-2"/> Ouvrir le reçu
                    </a>
                  </div>
                )}

                {/* Liste des participants */}
                <div>
                  <h3 className="font-bold text-xl text-slate-950 mb-5 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-slate-400" /> Participants et Billets ({selectedOrder.participants?.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.participants?.map((p, idx) => (
                      <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 transition-hover hover:border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold font-mono text-xs border border-slate-200">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-black text-xl text-slate-950 uppercase">{p.prenom} {p.nom}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                              <p className="text-xs font-medium text-slate-600 flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400"/> {p.telephone}</p>
                              {p.email && <p className="text-xs font-medium text-slate-600 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400"/> {p.email}</p>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:justify-end shrink-0">
                          <Badge className="bg-[#0f2035] hover:bg-[#0f2035] text-white font-bold px-4 py-1.5 border-0 text-xs rounded-full">
                            {TICKET_TYPES[p.type_ticket]?.name || p.type_ticket}
                          </Badge>
                          {p.is_checked_in ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 font-bold rounded-full">
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Scanné
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 px-3 py-1.5 font-bold rounded-full">
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> Non scanné
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
                <div className="p-8 bg-white border-t border-slate-100 flex items-center gap-4 justify-end rounded-b-[2.5rem]">
                  <Button variant="outline" className="rounded-full h-12 px-6 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold" onClick={() => handleUpdateStatus(selectedOrder.id!, 'rejected')} disabled={isUpdating === selectedOrder.id}>
                    Rejeter la commande
                  </Button>
                  <Button className="rounded-full h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20" onClick={() => handleUpdateStatus(selectedOrder.id!, 'confirmed')} disabled={isUpdating === selectedOrder.id}>
                    {isUpdating === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Confirmer le paiement & Envoyer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale Ajout Manuel */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-0 shadow-3xl p-8 bg-white">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase font-orbitron text-slate-950">Générer un billet manuel</DialogTitle>
            <DialogDescription className="text-slate-600 font-medium pt-1">Crée un billet immédiatement validé pour les ventes sur place (Cash) ou invités.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateManualTicket} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Prénom du participant</label>
                <input required className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-950 focus:border-slate-950 focus:outline-none transition-all placeholder:text-slate-400" value={newTicket.prenom} onChange={e => setNewTicket({...newTicket, prenom: e.target.value})} placeholder="Ex: Moussa" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Nom</label>
                <input required className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-950 focus:border-slate-950 focus:outline-none transition-all placeholder:text-slate-400" value={newTicket.nom} onChange={e => setNewTicket({...newTicket, nom: e.target.value})} placeholder="Ex: Diop" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Numéro de téléphone (Contact)</label>
              <input required type="tel" className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-950 focus:border-slate-950 focus:outline-none transition-all placeholder:text-slate-400" value={newTicket.telephone} onChange={e => setNewTicket({...newTicket, telephone: e.target.value})} placeholder="77 000 00 00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Type de billet à générer</label>
              <select title="t"  className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 focus:ring-2 focus:ring-slate-950 focus:border-slate-950 focus:outline-none font-bold text-slate-900 cursor-pointer appearance-none transition-all" value={newTicket.type_ticket} onChange={e => setNewTicket({...newTicket, type_ticket: e.target.value, amount: TICKET_TYPES[e.target.value as keyof typeof TICKET_TYPES]?.price || 0})}>
                {Object.entries(TICKET_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>{info.name} — {info.price.toLocaleString('fr-FR')} FCFA</option>
                ))}
              </select>
            </div>
            
            <Button type="submit" className="w-full h-14 text-lg bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-xl shadow-slate-950/20 mt-6 font-bold" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Plus className="w-5 h-5 mr-3" />} 
              Générer et Valider le Billet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if(status === 'confirmed' || status === 'validated') return <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 font-bold uppercase text-[10px] rounded-full shrink-0"><CheckCircle className="w-3 h-3 mr-1.5" /> Validé</Badge>
  if(status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1 font-bold uppercase text-[10px] rounded-full shrink-0"><XCircle className="w-3 h-3 mr-1.5" /> Rejeté</Badge>
  return <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1 font-bold uppercase text-[10px] rounded-full shrink-0"><Clock className="w-3 h-3 mr-1.5 animate-pulse" /> Attente</Badge>
}