"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, Check, Loader2, Banknote, CheckCircle2, Ticket } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { createOrder, uploadPaymentScreenshot } from "@/lib/actions"
import { Participant } from "@/lib/types"

// Dictionnaire sécurisé pour les tickets et prix exacts
const TICKETS_DATA = {
  exposition: { name: "Ticket Exposition", price: 1000 },
  cqt: { name: "Ticket Expo + CQT", price: 2000 },
  all_access: { name: "Ticket All Access", price: 3000 },
}

type Step = "participants" | "payment" | "confirmation"
type PaymentMethod = "wave" | "orange" | "cash"
type TicketKey = keyof typeof TICKETS_DATA

const WAVE_PAYMENT_LINK = "https://pay.wave.com/m/M_sn_qR2LqxyK6nZv/c/sn/"
const PAYMENT_PHONE_NUMBER = "78 110 99 79"

interface ParticipantForm extends Omit<Participant, "id" | "order_id" | "created_at" | "updated_at"> {
  isValid: boolean
  type_ticket: string // Correspondance stricte avec Supabase
}

export default function InscriptionPage() {
  const [step, setStep] = useState<Step>("participants")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wave")
  const [participants, setParticipants] = useState<ParticipantForm[]>([createEmptyParticipant()])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)

  function createEmptyParticipant(): ParticipantForm {
    return { nom: "", prenom: "", telephone: "", type_ticket: "exposition", activites: [], isValid: false }
  }

  function validateParticipant(p: ParticipantForm): boolean {
    return p.nom.trim().length >= 2 && p.prenom.trim().length >= 2
  }

  function updateParticipant(index: number, field: keyof ParticipantForm, value: unknown) {
    setParticipants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      updated[index].isValid = validateParticipant(updated[index])
      return updated
    })
  }

  function addParticipant() {
    if (participants.length < 10) setParticipants((prev) => [...prev, createEmptyParticipant()])
  }

  function removeParticipant(index: number) {
    if (participants.length > 1) setParticipants((prev) => prev.filter((_, i) => i !== index))
  }

  // RESTAURATION DES CONTRÔLEURS DE NAVIGATION
  function nextStep() {
    if (step === "participants") setStep("payment")
  }

  function prevStep() {
    if (step === "payment") setStep("participants")
  }

  // Calcul du total sécurisé basé sur le dictionnaire local
  const totalAmount = participants.reduce((sum, p) => {
    const ticketPrice = TICKETS_DATA[p.type_ticket as TicketKey]?.price || 0
    return sum + ticketPrice
  }, 0)

  const allParticipantsValid = participants.every((p) => p.isValid) && phone.trim().length >= 8

  async function handleFinalSubmit() {
    if ((paymentMethod === "wave" || paymentMethod === "orange") && !screenshot) {
      toast.error("Veuillez uploader la capture d'écran du paiement.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createOrder(email, phone, paymentMethod, participants.map(({ isValid, ...p }) => p), totalAmount)

      if (result.success && result.orderId) {
        if (screenshot && (paymentMethod === "wave" || paymentMethod === "orange")) {
          const formData = new FormData()
          formData.append("file", screenshot)
          await uploadPaymentScreenshot(result.orderId, formData)
        }
        
        setOrderId(result.orderId)
        setStep("confirmation")
        toast.success("Commande validée avec succès !")
      } else {
        toast.error(result.error || "Erreur lors de la création de la commande")
      }
    } catch {
      toast.error("Erreur critique du système.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-950">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/fond.jpg" alt="Fond" fill className="object-cover opacity-15" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white/90 to-slate-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        {step !== "confirmation" && (
          <div className="mb-12 text-center">
            <Link href="/" className="mb-6 inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-red-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au QG
            </Link>
            <h1 className="font-outfit text-5xl font-black uppercase text-slate-950 md:text-6xl tracking-tighter">
              Réservation <span className="text-red-600">Ticket</span>
            </h1>
            <p className="mt-3 font-medium text-slate-600 text-lg">Garantit ta Tabaski digne en réservant ton accès</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ETAPE 1 : PARTICIPANTS */}
          {step === "participants" && (
            <motion.div key="participants" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              
              <Card className="mb-8 overflow-hidden rounded-[2rem] border-white bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-md">
                <CardHeader className="bg-white/60 pb-5 border-b border-slate-100">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-500">
                    Contact Acheteur
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-bold">Téléphone WhatsApp (Requis)</Label>
                    <Input type="tel" placeholder="77 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-bold">Email (Optionnel)</Label>
                    <Input type="email" placeholder="luffy@egghead.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {participants.map((participant, index) => (
                <Card key={index} className="mb-6 overflow-hidden rounded-[2rem] border-white bg-white/80 shadow-lg backdrop-blur-md transition-all">
                  <div className="flex flex-row items-center justify-between border-b border-slate-100 bg-white/60 p-6">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-500">Participant {index + 1}</CardTitle>
                    {participants.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeParticipant(index)} className="rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="space-y-8 pt-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-800 font-bold">Nom</Label>
                        <Input placeholder="Monkey D." value={participant.nom} onChange={(e) => updateParticipant(index, "nom", e.target.value)} className="h-12 rounded-xl bg-white border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-800 font-bold">Prénom</Label>
                        <Input placeholder="Luffy" value={participant.prenom} onChange={(e) => updateParticipant(index, "prenom", e.target.value)} className="h-12 rounded-xl bg-white border-slate-200" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="font-black text-slate-800 uppercase tracking-wide">Choix du Ticket</Label>
                      <RadioGroup value={participant.type_ticket} onValueChange={(val) => updateParticipant(index, "type_ticket", val)} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {Object.entries(TICKETS_DATA).map(([key, data]) => (
                          <Label key={key} className={`flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-all shadow-sm hover:shadow-md ${participant.type_ticket === key ? "border-blue-600 bg-blue-50 shadow-blue-500/10" : "border-slate-100 bg-white hover:border-blue-200"}`}>
                            <div className="mb-3 flex items-center justify-between">
                              <span className="font-bold text-slate-900">{data.name}</span>
                              <RadioGroupItem value={key} className="text-blue-600 border-slate-300 sr-only" />
                            </div>
                            <span className="font-outfit text-2xl font-black text-blue-600">{data.price.toLocaleString('fr-FR')} F</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {participants.length < 10 && (
                <Button variant="outline" onClick={addParticipant} className="w-full h-20 rounded-[2rem] border-2 border-dashed border-slate-300 text-slate-500 font-bold text-lg hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all">
                  <Plus className="mr-3 h-6 w-6" /> Ajouter un participant
                </Button>
              )}
            </motion.div>
          )}

          {/* ETAPE 2 : PAIEMENT */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <Card className="overflow-hidden rounded-[2.5rem] border border-white bg-white/90 shadow-2xl backdrop-blur-lg">
                <CardHeader className="bg-slate-50/50 pb-8 pt-10 text-center border-b border-slate-100">
                  <CardTitle className="font-outfit text-3xl font-black uppercase text-slate-950 tracking-tighter">Validation du Paiement</CardTitle>
                  <CardDescription className="mt-4 text-lg font-medium text-slate-600 flex flex-col items-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Montant Total</span>
                    <span className="font-outfit text-5xl font-black text-red-600 tracking-tighter">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-10 pt-10 px-6 sm:px-10">
                  <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="grid gap-4 sm:grid-cols-3">
                    <Label className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-5 transition-all shadow-sm ${paymentMethod === 'wave' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      <RadioGroupItem value="wave" className="sr-only" />
                      <Image src="/images/logo wave.webp" alt="Wave" width={48} height={48} className="rounded-xl shadow-sm" />
                      <span className="font-black uppercase text-slate-900 text-sm tracking-wider">Wave</span>
                    </Label>

                    <Label className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-5 transition-all shadow-sm ${paymentMethod === 'orange' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      <RadioGroupItem value="orange" className="sr-only" />
                      <Image src="/images/OrangeMoney.png" alt="Orange Money" width={48} height={48} className="rounded-xl shadow-sm" />
                      <span className="font-black uppercase text-slate-900 text-sm tracking-wider">Orange</span>
                    </Label>

                    <Label className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-5 transition-all shadow-sm ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      <RadioGroupItem value="cash" className="sr-only" />
                      <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-sm"><Banknote className="h-6 w-6"/></div>
                      <span className="font-black uppercase text-slate-900 text-sm tracking-wider">Sur Place</span>
                    </Label>
                  </RadioGroup>

                  {paymentMethod !== "cash" && (
                    <div className="space-y-8">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-inner">
                        <p className="mb-3 font-bold text-slate-500 uppercase tracking-widest text-sm">Effectuez le transfert vers :</p>
                        
                        {paymentMethod === 'wave' && (
                          <a href={WAVE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-sm rounded-xl bg-blue-600 px-6 py-4 font-black uppercase tracking-wider text-white shadow-lg hover:bg-blue-700 hover:scale-[1.02] transition-all">
                             Payer par lien Wave
                          </a>
                        )}
                        {paymentMethod === 'orange' && (
                          <div>
                            <p className="font-outfit text-5xl font-black text-orange-600 tracking-tighter">{PAYMENT_PHONE_NUMBER}</p>
                            <p className="mt-2 text-xs font-bold uppercase text-slate-400">Titulaire : Japan Expo ESP</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="font-black text-slate-900 uppercase tracking-wide">Preuve de paiement (Obligatoire)</Label>
                        <div className="relative group">
                            <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} className="sr-only" id="screenshot-upload" />
                            <Label htmlFor="screenshot-upload" className={`flex flex-col items-center justify-center gap-4 cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all ${screenshot ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}>
                                <Upload className={`h-10 w-10 ${screenshot ? 'text-green-600' : 'text-slate-400'}`} />
                                <div className="text-center">
                                    <p className={`font-black uppercase tracking-wider ${screenshot ? 'text-green-700' : 'text-slate-700'}`}>
                                        {screenshot ? "Image Sélectionnée" : "Uploader la capture d'écran"}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        {screenshot ? screenshot.name : "Formats acceptés : PNG, JPG, WEBP"}
                                    </p>
                                </div>
                            </Label>
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === "cash" && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                      <p className="font-black uppercase text-xl text-green-950">Option Sur Place Validée</p>
                      <p className="mt-3 text-green-800 font-medium leading-relaxed">
                        Votre réservation sera mise en attente. Le règlement se fera directement au guichet le jour de l'événement.<br/>
                        <span className="font-bold text-red-600">Attention : Une majoration de +500 FCFA par ticket s'applique pour le paiement sur place.</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ETAPE 3 : CONFIRMATION */}
          {step === "confirmation" && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-10">
              <Card className="mx-auto max-w-md overflow-hidden rounded-[2.5rem] border border-white bg-white/90 shadow-2xl backdrop-blur-md">
                <CardContent className="pb-12 pt-14 px-8">
                  <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-green-100 shadow-inner">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                  
                  <h2 className="font-outfit mb-4 text-4xl font-black uppercase text-slate-950 tracking-tighter">
                    Opération Réussie
                  </h2>
                  <p className="mb-10 font-medium text-lg text-slate-600 leading-relaxed">
                    Ta réservation pour la Japan Expo a bien été transmise. Nos équipes valideront l'accès sous peu.
                  </p>

                  <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Identifiant de commande</p>
                    <p className="font-mono text-lg font-bold text-slate-950 tracking-widest break-all">{orderId}</p>
                  </div>

                  <div className="space-y-4">
                    <Link href={`/ticket/${orderId}`} className="block">
                      <Button className="w-full rounded-full bg-blue-600 py-8 text-lg font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                        <Ticket className="mr-3 h-6 w-6" /> Inspecter mes tickets
                      </Button>
                    </Link>
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full rounded-full border-slate-200 py-8 font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all">
                        Retour à l'accueil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION BOTTOM */}
        {step !== "confirmation" && (
          <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button variant="ghost" onClick={prevStep} disabled={step === "participants"} className="w-full sm:w-auto rounded-full px-8 py-6 text-slate-500 hover:bg-white/60 font-bold uppercase tracking-wider">
              <ArrowLeft className="mr-2 h-5 w-5" /> Précédent
            </Button>

            {step === "payment" ? (
              <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full sm:w-auto rounded-full bg-red-600 px-12 py-8 text-xl font-black uppercase tracking-wider text-white shadow-2xl shadow-red-600/40 hover:bg-red-700 hover:scale-105 transition-all">
                {isSubmitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <><Check className="mr-3 h-6 w-6"/> Confirmer la réservation</>}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <div className="text-center sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Provisoire</p>
                  <p className="font-outfit text-2xl font-black text-slate-900">{totalAmount.toLocaleString('fr-FR')} F</p>
                </div>
                <Button onClick={nextStep} disabled={!allParticipantsValid} className="w-full sm:w-auto rounded-full bg-slate-950 px-10 py-8 text-lg font-black uppercase tracking-wider text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all">
                  Suivant <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}