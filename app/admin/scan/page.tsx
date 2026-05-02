'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, StopCircle, CheckCircle, XCircle, AlertTriangle, ArrowLeft, User, Ticket } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Participant, TICKET_TYPES, EVENT_INFO } from '@/lib/types'
import { checkInParticipant, getParticipantById, getOrderWithParticipants } from '@/lib/actions'

type ScanResult = {
  status: 'success' | 'already_scanned' | 'not_paid' | 'not_found' | 'error'
  participant?: Participant
  message: string
}

export default function AdminScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop()
      }
    }
  }, [])
  
  async function startScanning() {
    if (!containerRef.current) return
    
    try {
      scannerRef.current = new Html5Qrcode('qr-reader')
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScan,
        () => {} // ignore errors during scanning
      )
      
      setIsScanning(true)
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra')
    }
  }
  
  async function stopScanning() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }
  }
  
  async function handleScan(decodedText: string) {
    // Extract participant ID from URL
    const match = decodedText.match(/\/verify\/([a-f0-9-]+)/i)
    if (!match) {
      setLastResult({
        status: 'error',
        message: 'QR code invalide'
      })
      return
    }
    
    const participantId = match[1]
    
    // Pause scanning while processing
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.pause()
    }
    
    try {
      // First get participant info
      const participantResult = await getParticipantById(participantId)
      
      if (!participantResult.success || !participantResult.participant) {
        setLastResult({
          status: 'not_found',
          message: 'Participant non trouvé'
        })
        return
      }
      
      const participant = participantResult.participant
      
      // Check payment status
      const orderResult = await getOrderWithParticipants(participant.order_id!)
      if (!orderResult.success || orderResult.order?.payment_status !== 'confirmed') {
        setLastResult({
          status: 'not_paid',
          participant,
          message: 'Paiement non confirmé'
        })
        return
      }
      
      // Try to check in
      const checkInResult = await checkInParticipant(participantId)
      
      if (checkInResult.success) {
        setLastResult({
          status: 'success',
          participant: checkInResult.participant,
          message: 'Entrée validée!'
        })
        setScanCount(prev => prev + 1)
        toast.success('Billet validé!')
      } else if (checkInResult.error?.includes('Déjà scanné')) {
        setLastResult({
          status: 'already_scanned',
          participant: checkInResult.participant,
          message: checkInResult.error
        })
        toast.warning('Billet déjà scanné!')
      } else {
        setLastResult({
          status: 'error',
          participant: checkInResult.participant,
          message: checkInResult.error || 'Erreur lors du scan'
        })
      }
    } catch (error) {
      setLastResult({
        status: 'error',
        message: 'Erreur de connexion'
      })
    } finally {
      // Resume scanning after a delay
      setTimeout(async () => {
        if (scannerRef.current && isScanning) {
          try {
            await scannerRef.current.resume()
          } catch (e) {
            // Ignore resume errors
          }
        }
      }, 2000)
    }
  }
  
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Link>
          <h1 className="font-orbitron text-2xl font-bold">Scanner QR</h1>
          <p className="text-muted-foreground">{EVENT_INFO.name}</p>
        </div>
        
        {/* Scan counter */}
        <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border border-border">
          <span className="text-sm text-muted-foreground">Entrées validées</span>
          <Badge variant="secondary" className="font-orbitron text-lg px-3 py-1">
            {scanCount}
          </Badge>
        </div>
        
        {/* Scanner */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div 
              ref={containerRef}
              className="relative aspect-square bg-muted"
            >
              <div id="qr-reader" className="w-full h-full" />
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Caméra inactive</p>
                  <Button onClick={startScanning}>
                    <Camera className="w-4 h-4 mr-2" />
                    Démarrer le scanner
                  </Button>
                </div>
              )}
            </div>
            
            {isScanning && (
              <div className="p-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={stopScanning}
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Last result */}
        {lastResult && (
          <Card className={`mb-6 border-2 ${
            lastResult.status === 'success' ? 'border-green-500' :
            lastResult.status === 'already_scanned' ? 'border-amber-500' :
            'border-red-500'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {lastResult.status === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : lastResult.status === 'already_scanned' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <CardTitle className={`text-lg ${
                    lastResult.status === 'success' ? 'text-green-500' :
                    lastResult.status === 'already_scanned' ? 'text-amber-500' :
                    'text-red-500'
                  }`}>
                    {lastResult.status === 'success' ? 'Entrée validée' :
                     lastResult.status === 'already_scanned' ? 'Déjà scanné' :
                     lastResult.status === 'not_paid' ? 'Paiement non confirmé' :
                     'Erreur'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{lastResult.message}</p>
                </div>
              </div>
            </CardHeader>
            
            {lastResult.participant && (
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {lastResult.participant.prenom} {lastResult.participant.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lastResult.participant.telephone}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge 
                      variant="secondary" 
                      className={`bg-gradient-to-r ${TICKET_TYPES[lastResult.participant.type_ticket].color} text-white border-0`}
                    >
                      {TICKET_TYPES[lastResult.participant.type_ticket].name}
                    </Badge>
                  </div>
                </div>
                
                {lastResult.participant.is_checked_in && lastResult.participant.scanned_at && (
                  <p className="text-xs text-muted-foreground">
                    Scanné le {new Date(lastResult.participant.scanned_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )}
        
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Cliquez sur &quot;Démarrer le scanner&quot;</p>
            <p>2. Pointez la caméra vers le QR code du billet</p>
            <p>3. Attendez la validation automatique</p>
            <p className="text-xs mt-4">
              Les billets non payés ou déjà scannés seront automatiquement rejetés.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
