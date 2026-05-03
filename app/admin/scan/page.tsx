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
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        () => {} // ignore errors during scanning
      )
      
      setIsScanning(true)
    } catch (error) {
      toast.error("Impossible d'accéder à la caméra")
    }
  }
  
  async function stopScanning() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }
  }
  
  async function handleScan(decodedText: string) {
    const match = decodedText.match(/\/verify\/([a-f0-9-]+)/i)
    if (!match) {
      setLastResult({ status: 'error', message: 'QR code invalide' })
      return
    }
    
    const participantId = match[1]
    
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.pause()
    }
    
    try {
      const participantResult = await getParticipantById(participantId)
      
      if (!participantResult.success || !participantResult.participant) {
        setLastResult({ status: 'not_found', message: 'Participant non trouvé' })
        return
      }
      
      const participant = participantResult.participant
      const orderResult = await getOrderWithParticipants(participant.order_id!)
      
      if (!orderResult.success || orderResult.order?.payment_status !== 'confirmed') {
        setLastResult({ status: 'not_paid', participant, message: 'Paiement non confirmé' })
        return
      }
      
      const checkInResult = await checkInParticipant(participantId)
      
      if (checkInResult.success) {
        setLastResult({ status: 'success', participant, message: 'Entrée validée!' })
        setScanCount(prev => prev + 1)
        toast.success('Billet validé!')
      } else if (checkInResult.error?.includes('Déjà scanné')) {
        setLastResult({ status: 'already_scanned', participant, message: checkInResult.error })
        toast.warning('Billet déjà scanné!')
      } else {
        setLastResult({ status: 'error', participant, message: checkInResult.error || 'Erreur lors du scan' })
      }
    } catch (error) {
      setLastResult({ status: 'error', message: 'Erreur de connexion' })
    } finally {
      setTimeout(async () => {
        if (scannerRef.current && isScanning) {
          try { await scannerRef.current.resume() } catch (e) {}
        }
      }, 2000)
    }
  }
  
  return (
    <main className="relative min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-slate-50 pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au QG
          </Link>
          <h1 className="font-orbitron text-3xl font-black text-slate-900 uppercase">Scanner <span className="text-blue-600">QR</span></h1>
          <p className="text-slate-600 font-medium">{EVENT_INFO.name} - Portail de sécurité</p>
        </div>
        
        {/* Scan counter */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Entrées validées</span>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-orbitron text-xl px-4 py-1 rounded-full">
            {scanCount}
          </Badge>
        </div>
        
        {/* Scanner Card */}
        <Card className="mb-6 overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl backdrop-blur-md">
          <CardContent className="p-2">
            <div ref={containerRef} className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner">
              <div id="qr-reader" className="w-full h-full" />
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <Camera className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 font-medium mb-4">Caméra inactive</p>
                  <Button onClick={startScanning} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                    <Camera className="w-4 h-4 mr-2" /> Démarrer l'analyse
                  </Button>
                </div>
              )}
            </div>
            
            {isScanning && (
              <div className="p-4 mt-2">
                <Button variant="destructive" className="w-full rounded-full shadow-lg shadow-red-500/20" onClick={stopScanning}>
                  <StopCircle className="w-4 h-4 mr-2" /> Interrompre le flux
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Last result Display */}
        {lastResult && (
          <Card className={`mb-6 overflow-hidden rounded-[2rem] border-2 shadow-lg backdrop-blur-md ${
            lastResult.status === 'success' ? 'border-green-400 bg-green-50/90' :
            lastResult.status === 'already_scanned' ? 'border-yellow-400 bg-yellow-50/90' :
            'border-red-400 bg-red-50/90'
          }`}>
            <CardHeader className="pb-2 bg-white/50 border-b border-black/5">
              <div className="flex items-center gap-3">
                {lastResult.status === 'success' ? <CheckCircle className="w-8 h-8 text-green-500" /> : 
                 lastResult.status === 'already_scanned' ? <AlertTriangle className="w-8 h-8 text-yellow-500" /> : 
                 <XCircle className="w-8 h-8 text-red-500" />}
                <div>
                  <CardTitle className={`text-xl font-black uppercase ${
                    lastResult.status === 'success' ? 'text-green-700' :
                    lastResult.status === 'already_scanned' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {lastResult.status === 'success' ? 'Autorisé' :
                     lastResult.status === 'already_scanned' ? 'Déjà scanné' :
                     lastResult.status === 'not_paid' ? 'Paiement requis' : 'Erreur critique'}
                  </CardTitle>
                  <p className="text-sm font-medium text-slate-600">{lastResult.message}</p>
                </div>
              </div>
            </CardHeader>
            
            {lastResult.participant && (
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{lastResult.participant.prenom} {lastResult.participant.nom}</p>
                    <p className="text-sm text-slate-500">{lastResult.participant.telephone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 rounded-full">
                      {lastResult.participant.type_ticket}
                    </Badge>
                  </div>
                </div>
                
                {lastResult.participant.is_checked_in && lastResult.participant.scanned_at && (
                  <p className="text-xs font-medium text-slate-500 bg-white/50 p-2 rounded-lg inline-block">
                    Scanné le {new Date(lastResult.participant.scanned_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </main>
  )
}