'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Loader2, User, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Participant, TICKET_TYPES, EVENT_INFO } from '@/lib/types'
import { checkInParticipant } from '@/lib/actions'

interface VerifyTicketProps {
  participant: Participant
  isPaid: boolean
}

export function VerifyTicket({ participant: initialParticipant, isPaid }: VerifyTicketProps) {
  const [participant, setParticipant] = useState(initialParticipant)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<'success' | 'already_scanned' | 'not_paid' | null>(null)
  
  // NOUVEAUX STATES POUR LE DEBUG
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  const ticketInfo = TICKET_TYPES[participant.type_ticket || participant.type_ticket as any] || { name: participant.type_ticket || 'Inconnu' }
  
  async function handleCheckIn() {
    setIsChecking(true)
    setCheckResult(null)
    setErrorMessage(null)
    setDebugInfo(null)
    
    console.log("🔍 [DÉBUT SCAN] ID:", participant.id)
    console.log("🔍 [DÉBUT SCAN] isPaid passé par la page parente:", isPaid)

    try {
      // On retire la sécurité frontend pour forcer l'appel serveur et voir ce qu'il répond
      const result = await checkInParticipant(participant.id!)
      
      console.log("🚨 [RÉPONSE SERVEUR]:", result)
      
      if (result.debug) {
        console.warn("🛠️ [INFO DEBUG]:", result.debug)
        setDebugInfo(result.debug)
      }

      if (result.success && result.participant) {
        setParticipant(result.participant)
        setCheckResult('success')
      } else {
        setErrorMessage(result.error || 'Erreur inconnue')
        if (result.error?.includes('Déjà scanné') || participant.is_checked_in) {
          setCheckResult('already_scanned')
          if (result.participant) setParticipant(result.participant)
        } else if (result.error?.includes('Paiement')) {
          setCheckResult('not_paid')
        }
      }
    } catch (error) {
      console.error("Crash Front:", error)
      setErrorMessage("Erreur d'exécution")
    } finally {
      setIsChecking(false)
    }
  }
  
  const isAlreadyScanned = participant.is_checked_in || checkResult === 'already_scanned'
  const isUnpaid = !isPaid || checkResult === 'not_paid'

  return (
    <div className="max-w-md mx-auto pt-4">
      <div className="text-center mb-4">
        <h1 className="font-orbitron text-2xl font-black">{EVENT_INFO.name}</h1>
        <p className="text-sm font-bold text-slate-500 uppercase">Scanner de Billet</p>
      </div>
      
      <Card className="border-2 shadow-xl overflow-hidden">
        <div className={`h-3 w-full ${isAlreadyScanned ? 'bg-amber-500' : isUnpaid ? 'bg-red-600' : 'bg-blue-600'}`} />
        
        <CardHeader className="bg-slate-50 pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase text-slate-500 font-bold">Détails</CardTitle>
            <Badge variant="outline" className="border-2 font-bold text-sm">
              {ticketInfo.name}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border-2">
              <User className="w-7 h-7 text-slate-700" />
            </div>
            <div>
              <p className="font-black text-2xl uppercase leading-none">
                {participant.prenom} <br/> {participant.nom}
              </p>
            </div>
          </div>

          <div className="pt-4">
            {isAlreadyScanned ? (
              <div className="rounded-xl p-6 bg-amber-100 border-4 border-amber-500 text-center">
                <AlertTriangle className="w-16 h-16 text-amber-600 mx-auto mb-2" />
                <p className="font-black text-amber-700 uppercase text-2xl">DÉJÀ ENTRÉ</p>
              </div>
            ) : isUnpaid ? (
              <div className="rounded-xl p-6 bg-red-50 border-4 border-red-500 text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-2" />
                <p className="font-black text-red-600 uppercase text-2xl">NON PAYÉ</p>
                <p className="font-bold text-red-700 mt-2">{errorMessage}</p>
                
                {/* 🚨 AFFICHAGE DU DEBUG SUR L'ÉCRAN 🚨 */}
                {debugInfo && (
                  <div className="mt-4 p-3 bg-slate-900 text-green-400 font-mono text-xs text-left rounded-lg overflow-x-auto">
                    <p className="font-bold text-white mb-1">🔍 DEBUG :</p>
                    {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
                  </div>
                )}
                
                {/* BOUTON FORCER POUR TESTER QUAND MÊME */}
                <Button onClick={handleCheckIn} variant="outline" className="mt-4 w-full border-red-500 text-red-600">
                  Relancer l'analyse
                </Button>
              </div>
            ) : checkResult === 'success' ? (
              <div className="rounded-xl p-6 bg-green-50 border-4 border-green-500 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
                <p className="font-black text-green-600 uppercase text-3xl">OK - ENTRÉE</p>
              </div>
            ) : (
              <Button onClick={handleCheckIn} disabled={isChecking} className="w-full h-20 text-xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg">
                {isChecking ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Ticket className="w-8 h-8 mr-3" /> VALIDER LE BILLET</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}