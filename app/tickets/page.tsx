"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, Check, Loader2, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

import { TICKET_TYPES, ACTIVITIES, EVENT_INFO, Participant, TicketType, Activity } from "@/lib/types"
import { createOrder, uploadPaymentScreenshot } from "@/lib/actions"

type Step = "participants" | "activities" | "payment" | "confirmation"
type PaymentMethod = "wave" | "orange" | "cash"

interface ParticipantForm extends Omit<Participant, "id" | "order_id" | "created_at" | "updated_at"> {
  isValid: boolean
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
    return { nom: "", prenom: "", telephone: "", type_ticket: "expo_cat", activites: [], isValid: false }
  }

  function validateParticipant(p: ParticipantForm): boolean {
    return p.nom.length >= 2 && p.prenom.length >= 2
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

  function toggleActivity(index: number, activityId: Activity) {
    setParticipants((prev) => {
      const updated = [...prev]
      const p = updated[index]
      p.activites = p.activites.includes(activityId) 
        ? p.activites.filter((a) => a !== activityId) 
        : [...p.activites, activityId]
      return updated
    })
  }

  const totalAmount = participants.reduce((sum, p) => sum + TICKET_TYPES[p.type_ticket].price, 0)
  const allParticipantsValid = participants.every((p) => p.isValid) && phone.length >= 8
  const showActivities = participants.some((p) => p.type_ticket === "EXPO_CAT" || p.type_ticket === "ALL_ACCESS")

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
      toast.error("Erreur critique.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function nextStep() {
    if (step === "participants") setStep(showActivities ? "activities" : "payment")
    else if (step === "activities") setStep("payment")
  }

  function prevStep() {
    if (step === "activities") setStep("participants")
    else if (step === "payment") setStep(showActivities ? "activities" : "participants")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="absolute inset-0 opacity-30">
        <Image src="/images/egghead-bg.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-slate-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        {step !== "confirmation" && (
          <div className="mb-12 text-center">
            <Link href="/" className="mb-6 inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au QG
            </Link>
            <h1 className="font-orbitron text-4xl font-black uppercase text-slate-900 md:text-5xl">
              Pass <span className="text-red-600">Egghead</span>
            </h1>
            <p className="mt-2 font-medium text-slate-600">Configure tes accès pour la Japan Expo</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: PARTICIPANTS */}
          {step === "participants" && (
            <motion.div key="participants" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              
              <Card className="mb-8 overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl shadow-slate-200/50 backdrop-blur-md">
                <CardHeader className="bg-white/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Smartphone className="text-blue-600" /> Contact Acheteur
                  </CardTitle>
                  <CardDescription>Qui règle la commande ?</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Téléphone (Requis)</Label>
                    <Input type="tel" placeholder="77 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border-slate-200 bg-white shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Optionnel)</Label>
                    <Input type="email" placeholder="luffy@egghead.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border-slate-200 bg-white shadow-sm" />
                  </div>
                </CardContent>
              </Card>

              {participants.map((participant, index) => (
                <Card key={index} className="mb-6 overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-lg backdrop-blur-md">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white/50 pb-4">
                    <CardTitle className="text-lg">Participant {index + 1}</CardTitle>
                    {participants.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeParticipant(index)} className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input placeholder="Monkey D." value={participant.nom} onChange={(e) => updateParticipant(index, "nom", e.target.value)} className="rounded-xl bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Prénom</Label>
                        <Input placeholder="Luffy" value={participant.prenom} onChange={(e) => updateParticipant(index, "prenom", e.target.value)} className="rounded-xl bg-white" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-bold text-slate-700">Niveau d'Accès</Label>
                      <RadioGroup value={participant.type_ticket} onValueChange={(val) => updateParticipant(index, "type_ticket", val as TicketType)} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {Object.values(TICKET_TYPES).map((ticket) => (
                          <Label key={ticket.type} className={`flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition-all ${participant.type_ticket === ticket.type ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-100 bg-white hover:border-blue-200"}`}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-bold text-slate-900">{ticket.name}</span>
                              <RadioGroupItem value={ticket.type} className="text-blue-600" />
                            </div>
                            <span className="text-lg font-black text-blue-600">{ticket.price} FCFA</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {participants.length < 10 && (
                <Button variant="outline" onClick={addParticipant} className="w-full rounded-[2rem] border-dashed border-slate-300 py-8 text-slate-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600">
                  <Plus className="mr-2 h-5 w-5" /> Ajouter un Nakama
                </Button>
              )}
            </motion.div>
          )}

          {/* STEP 2: ACTIVITIES */}
          {step === "activities" && (
            <motion.div key="activities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl backdrop-blur-md">
                <CardHeader className="bg-white/50 pb-4">
                  <CardTitle className="text-xl font-bold">Sélection des Activités</CardTitle>
                  <CardDescription>Optionnel - Choisis tes activités par participant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {participants.map((participant, pIndex) => {
                    if (participant.type_ticket === "EXPO") return null

                    return (
                      <div key={pIndex} className="space-y-4">
                        <h4 className="font-bold text-slate-900">
                          {participant.prenom || "Participant"} {participant.nom}
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {ACTIVITIES.map((activity) => (
                            <Label key={activity.id} className={`flex cursor-pointer items-start space-x-3 rounded-2xl border-2 p-4 transition-all ${participant.activites.includes(activity.id) ? "border-blue-400 bg-blue-50" : "border-slate-100 bg-white"}`}>
                              <Checkbox
                                checked={participant.activites.includes(activity.id)}
                                onCheckedChange={() => toggleActivity(pIndex, activity.id)}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{activity.name}</p>
                                <p className="text-xs text-slate-500">{activity.description}</p>
                              </div>
                            </Label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl backdrop-blur-md">
                <CardHeader className="bg-white/50 pb-8 text-center">
                  <CardTitle className="font-orbitron text-3xl font-black uppercase">Paiement</CardTitle>
                  <CardDescription className="mt-2 text-lg">
                    Total à régler : <span className="font-orbitron text-2xl font-black text-red-600">{totalAmount} FCFA</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8 pt-8">
                  <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="grid gap-4 sm:grid-cols-3">
                    <Label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${paymentMethod === 'wave' ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                      <RadioGroupItem value="wave" className="sr-only" />
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white"><Smartphone/></div>
                      <span className="font-bold">Wave</span>
                    </Label>
                    <Label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${paymentMethod === 'orange' ? 'border-orange-400 bg-orange-50' : 'border-slate-100 bg-white'}`}>
                      <RadioGroupItem value="orange" className="sr-only" />
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white"><Smartphone/></div>
                      <span className="font-bold">Orange Money</span>
                    </Label>
                    <Label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${paymentMethod === 'cash' ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-white'}`}>
                      <RadioGroupItem value="cash" className="sr-only" />
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white"><Banknote/></div>
                      <span className="font-bold">Sur Place (Jour J)</span>
                    </Label>
                  </RadioGroup>

                  {paymentMethod !== "cash" && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                      <p className="mb-2 font-bold text-blue-900">Instructions {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}</p>
                      <p className="mb-4 text-blue-800">Envoyez {totalAmount} FCFA au <strong className="text-xl">77 XXX XX XX</strong></p>
                      
                      <Label className="font-bold text-slate-700">Preuve de paiement (Screenshot)</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} className="mt-2 bg-white" />
                    </div>
                  )}
                  {paymentMethod === "cash" && (
                    <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
                      <p className="font-bold text-green-900">Paiement sur place sélectionné.</p>
                      <p className="mt-2 text-sm text-green-800">Votre billet sera mis en attente. Le paiement (majoré de 500F) se fera à l'entrée.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION FULL */}
          {step === "confirmation" && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card className="mx-auto max-w-md overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl backdrop-blur-md">
                <CardContent className="pb-8 pt-10">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-inner">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  
                  <h2 className="font-orbitron mb-2 text-3xl font-black uppercase text-slate-900">
                    Transmission Réussie
                  </h2>
                  <p className="mb-8 font-medium text-slate-600">
                    Ton pass Egghead est en cours de validation par nos scientifiques.
                  </p>

                  <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Identifiant de Registre</p>
                    <p className="font-mono text-sm font-bold text-slate-900">{orderId}</p>
                  </div>

                  <div className="space-y-4">
                    <Link href={`/ticket/${orderId}`} className="block">
                      <Button className="w-full rounded-full bg-blue-600 py-6 text-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700">
                        Inspecter mes Pass
                      </Button>
                    </Link>
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full rounded-full border-slate-200 py-6 font-bold text-slate-600 hover:bg-slate-50">
                        Retourner au QG
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
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={prevStep} disabled={step === "participants"} className="rounded-full text-slate-500 hover:bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
            </Button>

            {step === "payment" ? (
              <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="rounded-full bg-red-600 px-8 py-6 text-lg font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Check className="mr-2 h-5 w-5"/> Confirmer</>}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!allParticipantsValid} className="rounded-full bg-blue-600 px-8 py-6 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}