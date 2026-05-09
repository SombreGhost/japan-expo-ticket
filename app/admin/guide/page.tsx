'use client'

import Link from 'next/link'
import { 
  ArrowLeft, ShieldCheck, QrCode, Search, CheckCircle, 
  XCircle, Clock, AlertTriangle, Ticket, Users, CreditCard, 
  Eye, Plus, Smartphone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-slate-100 p-4 sm:p-6 rounded-[2rem] min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au QG Admin
        </Link>
        <h1 className="font-orbitron text-3xl md:text-4xl font-black uppercase text-slate-950 tracking-tight">
          Manuel <span className="text-blue-600">Opératoire</span>
        </h1>
        <p className="text-slate-600 font-medium text-lg mt-2">Guide d'utilisation officiel pour le staff et la sécurité.</p>
      </div>

      {/* SECTION 1 : Le Tableau de bord (QG) */}
      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-slate-950 text-white p-8">
          <CardTitle className="text-2xl font-black uppercase flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            1. Gestion des Commandes (QG)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-950 flex items-center">
              <Search className="w-5 h-5 mr-2 text-slate-400" /> Retrouver un client
            </h3>
            <p className="text-slate-600 font-medium">
              Utilisez la barre de recherche en haut du tableau de bord. Vous pouvez taper un <strong className="text-slate-900">nom</strong>, un <strong className="text-slate-900">numéro de téléphone</strong> ou une <strong className="text-slate-900">adresse email</strong>. La liste se mettra à jour instantanément sans avoir besoin de recharger la page.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-950 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-slate-400" /> Validation des paiements
            </h3>
            <p className="text-slate-600 font-medium mb-4">
              Lorsqu'une commande arrive, elle est en statut <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-0.5 font-bold uppercase text-[10px] ml-1"><Clock className="w-3 h-3 mr-1 inline" /> Attente</Badge>. Voici la procédure stricte :
            </p>
            <ul className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">1</span>
                <span className="text-slate-700 font-medium">Cliquez sur l'icône <Eye className="w-4 h-4 inline text-slate-500 mx-1"/> pour ouvrir les détails de la commande.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">2</span>
                <span className="text-slate-700 font-medium">Vérifiez la <strong className="text-slate-900">preuve de paiement</strong> (capture d'écran) et croisez avec vos SMS/Applis (Wave, Orange Money, etc.).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">3</span>
                <span className="text-slate-700 font-medium">Si l'argent est bien reçu, cliquez sur <strong className="text-green-600">Valider & Envoyer les billets</strong>. Les QR codes sont envoyés au client par email/SMS.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm shrink-0">4</span>
                <span className="text-slate-700 font-medium">Si le reçu est faux ou l'argent non reçu, cliquez sur <strong className="text-red-600">Rejeter la commande</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-950 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-slate-400" /> Vente sur place (Guichet / Cash)
            </h3>
            <p className="text-slate-600 font-medium">
              Si un client paie en espèces à l'entrée, ne le faites pas passer par le site public. Cliquez sur le bouton noir <strong className="text-slate-900">Entrée Rapide</strong>. Remplissez ses infos. Le billet sera créé et <strong>immédiatement validé</strong> dans le système.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 : La Sécurité (Scanner) */}
      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-blue-600 text-white p-8">
          <CardTitle className="text-2xl font-black uppercase flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-200" />
            2. Portail de Sécurité (Scanner)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <p className="text-slate-600 font-medium text-lg">
            La page de scan (<Link href="/admin/scan" className="text-blue-600 hover:underline font-bold">/admin/scan</Link>) est conçue pour être utilisée sur mobile par les agents de sécurité. Elle obéit à la <strong>règle stricte des 3 couleurs</strong>.
          </p>

          <div className="grid gap-4">
            {/* Cas Vert */}
            <div className="p-6 rounded-2xl border-2 border-green-400 bg-green-50 flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-xl font-black uppercase text-green-700 mb-1">Vert : Autorisé</h4>
                <p className="text-green-800 font-medium">Le billet est authentique, la commande a été payée, et la personne n'est pas encore rentrée.</p>
                <Badge className="mt-3 bg-green-600 hover:bg-green-600 text-white border-0">Laissez passer</Badge>
              </div>
            </div>

            {/* Cas Jaune */}
            <div className="p-6 rounded-2xl border-2 border-yellow-400 bg-yellow-50 flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-xl font-black uppercase text-yellow-700 mb-1">Jaune : Déjà Scanné</h4>
                <p className="text-yellow-800 font-medium">Ce QR code est vrai, mais <strong>il a déjà été flashé à l'entrée</strong> à une heure précise (affichée à l'écran). C'est probablement une capture d'écran partagée entre amis.</p>
                <Badge className="mt-3 bg-yellow-600 hover:bg-yellow-600 text-white border-0">Refusez l'accès</Badge>
              </div>
            </div>

            {/* Cas Rouge */}
            <div className="p-6 rounded-2xl border-2 border-red-400 bg-red-50 flex items-start gap-4">
              <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-xl font-black uppercase text-red-700 mb-1">Rouge : Rejeté / Erreur</h4>
                <p className="text-red-800 font-medium">Soit le QG n'a pas encore validé son paiement, soit c'est un faux QR code. La personne doit régler le problème avec la billetterie.</p>
                <Badge className="mt-3 bg-red-600 hover:bg-red-600 text-white border-0">Refusez l'accès / Renvoyez au QG</Badge>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl text-slate-300 mt-6 flex gap-4">
            <Smartphone className="w-8 h-8 text-slate-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold mb-1">Astuce pour les vigiles</h4>
              <p className="text-sm font-medium">Si le scan est lent, demandez au client de monter la <strong>luminosité de son écran au maximum</strong>. Si le QR code est froissé ou illisible, l'agent au QG peut retrouver le client avec son numéro de téléphone dans l'onglet "QG Admin".</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}