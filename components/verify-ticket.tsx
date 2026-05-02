'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Loader2, User, Ticket, Calendar } from 'lucide-react'

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const ticketInfo = TICKET_TYPES[participant.type_ticket]
  
  async function handleCheckIn() {
    setIsChecking(true)
    setCheckResult(null)
    setErrorMessage(null)
    
    try {
      const result = await checkInParticipant(participant.id!)
      
      if (result.success && result.participant) {
        setParticipant(result.participant)
        setCheckResult('success')
      } else {
        if (result.error?.includes('Déjà scanné')) {
          setCheckResult('already_scanned')
          if (result.participant) {
            setParticipant(result.participant)
          }
        } else if (result.error?.includes('Paiement non confirmé')) {
          setCheckResult('not_paid')
        }
        setErrorMessage(result.error || 'Erreur lors du scan')
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion')
    } finally {
      setIsChecking(false)
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-orbitron text-xl font-bold">{EVENT_INFO.name}</h1>
        <p className="text-sm text-muted-foreground">Vérification du billet</p>
      </div>
      
      <Card>
        <div className={`h-2 bg-gradient-to-r ${ticketInfo.color}`} />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Informations du participant</CardTitle>
            <Badge 
              variant="secondary" 
              className={`bg-gradient-to-r ${ticketInfo.color} text-white border-0`}
            >
              {ticketInfo.name}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">
                {participant.prenom} {participant.nom}
              </p>
              <p className="text-sm text-muted-foreground">{participant.telephone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{ticketInfo.name}</p>
              <p className="text-sm text-muted-foreground">{ticketInfo.price.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{EVENT_INFO.dates}</p>
              <p className="text-sm text-muted-foreground">{EVENT_INFO.location}</p>
            </div>
          </div>
          
          {/* Status display */}
          {participant.is_checked_in ? (
            <div className="rounded-lg p-4 bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-500">Déjà scanné</p>
                  <p className="text-sm text-muted-foreground">
                    Le {new Date(participant.scanned_at!).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ) : !isPaid ? (
            <div className="rounded-lg p-4 bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-red-500">Paiement non confirmé</p>
                  <p className="text-sm text-muted-foreground">
                    Ce billet ne peut pas être validé
                  </p>
                </div>
              </div>
            </div>
          ) : checkResult === 'success' ? (
            <div className="rounded-lg p-4 bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">Billet validé!</p>
                  <p className="text-sm text-muted-foreground">
                    Entrée autorisée
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={isChecking}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-600/90 hover:to-green-700/90"
              size="lg"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider l&apos;entrée
                </>
              )}
            </Button>
          )}
          
          {errorMessage && checkResult !== 'success' && (
            <p className="text-sm text-center text-red-500">{errorMessage}</p>
          )}
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              ID: {participant.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
