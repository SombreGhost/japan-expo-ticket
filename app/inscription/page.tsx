"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Check,
  Loader2,
  CreditCard,
} from "lucide-react"
import Link from "next/link"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

import {
  TICKET_TYPES,
  ACTIVITIES,
  PAYMENT_INFO,
  EVENT_INFO,
  Participant,
  TicketType,
  Activity,
} from "@/lib/types"
import { createOrder, uploadPaymentScreenshot } from "@/lib/actions"

type Step = "participants" | "activities" | "payment" | "confirmation"

interface ParticipantForm
  extends Omit<Participant, "id" | "order_id" | "created_at" | "updated_at"> {
  isValid: boolean
}

export default function InscriptionPage() {
  const [step, setStep] = useState<Step>("participants")
  const [email, setEmail] = useState("")
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    createEmptyParticipant(),
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)

  function createEmptyParticipant(): ParticipantForm {
    return {
      nom: "",
      prenom: "",
      telephone: "",
      type_ticket: "expo_cat",
      activites: [],
      isValid: false,
    }
  }

  function validateParticipant(p: ParticipantForm): boolean {
    return p.nom.length >= 2 && p.prenom.length >= 2 && p.telephone.length >= 8
  }

  function updateParticipant(
    index: number,
    field: keyof ParticipantForm,
    value: unknown
  ) {
    setParticipants((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      updated[index].isValid = validateParticipant(updated[index])
      return updated
    })
  }

  function addParticipant() {
    if (participants.length < 10) {
      setParticipants((prev) => [...prev, createEmptyParticipant()])
    }
  }

  function removeParticipant(index: number) {
    if (participants.length > 1) {
      setParticipants((prev) => prev.filter((_, i) => i !== index))
    }
  }

  function toggleActivity(index: number, activityId: Activity) {
    setParticipants((prev) => {
      const updated = [...prev]
      const participant = updated[index]

      if (participant.activites.includes(activityId)) {
        participant.activites = participant.activites.filter(
          (a) => a !== activityId
        )
      } else {
        participant.activites = [...participant.activites, activityId]
      }

      return updated
    })
  }

  const totalAmount = participants.reduce((sum, p) => {
    return sum + TICKET_TYPES[p.type_ticket].price
  }, 0)

  const allParticipantsValid =
    participants.every((p) => p.isValid) && email.includes("@")

  const showActivities = participants.some(
    (p) => p.type_ticket === "expo_cat" || p.type_ticket === "all_access"
  )

  async function handleCreateOrder() {
    setIsSubmitting(true)

    try {
      const result = await createOrder(
        email,
        participants.map(({ isValid, ...p }) => p),
        totalAmount
      )

      if (result.success && result.orderId) {
        setOrderId(result.orderId)
        setStep("payment")
      } else {
        toast.error(result.error || "Une erreur est survenue")
      }
    } catch {
      toast.error("Erreur lors de la création de la commande")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUploadScreenshot() {
    if (!orderId || !screenshot) return

    setUploadProgress(true)

    try {
      const formData = new FormData()
      formData.append("file", screenshot)

      const result = await uploadPaymentScreenshot(orderId, formData)

      if (result.success) {
        toast.success("Capture uploadée avec succès!")
        setStep("confirmation")
      } else {
        toast.error(result.error || "Erreur lors de l'upload")
      }
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploadProgress(false)
    }
  }

  function nextStep() {
    if (step === "participants") {
      if (showActivities) {
        setStep("activities")
      } else {
        handleCreateOrder()
      }
    } else if (step === "activities") {
      handleCreateOrder()
    }
  }

  function prevStep() {
    if (step === "activities") {
      setStep("participants")
    } else if (step === "payment") {
      setStep(showActivities ? "activities" : "participants")
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a1628]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/egghead-bg.png"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 to-[#0a1628]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            Inscription
          </h1>
          <p className="mt-2 text-white/60">
            {EVENT_INFO.name} - {EVENT_INFO.edition}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex max-w-md items-center justify-between">
          {["participants", "activities", "payment", "confirmation"].map(
            (s, i) => {
              const steps: Step[] = [
                "participants",
                "activities",
                "payment",
                "confirmation",
              ]
              const currentIndex = steps.indexOf(step)
              const isActive = i <= currentIndex
              const isCurrent = s === step

              if (s === "activities" && !showActivities) return null

              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#c41e3a] text-white"
                        : "bg-white/10 text-white/50"
                    } ${isCurrent ? "ring-2 ring-[#c41e3a] ring-offset-2 ring-offset-[#0a1628]" : ""}`}
                  >
                    {i < currentIndex ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`h-0.5 w-12 ${isActive ? "bg-[#c41e3a]" : "bg-white/10"}`}
                    />
                  )}
                </div>
              )
            }
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Participants */}
          {step === "participants" && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="mb-6 border-white/10 bg-[#0f2035]">
                <CardHeader>
                  <CardTitle className="text-white">Email de contact</CardTitle>
                  <CardDescription className="text-white/60">
                    Les billets seront envoyés à cette adresse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="max-w-md border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </CardContent>
              </Card>

              {participants.map((participant, index) => (
                <Card
                  key={index}
                  className="mb-4 border-white/10 bg-[#0f2035]"
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">
                        Participant {index + 1}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        {TICKET_TYPES[participant.type_ticket].name} -{" "}
                        {TICKET_TYPES[
                          participant.type_ticket
                        ].price.toLocaleString("fr-FR")}{" "}
                        FCFA
                      </CardDescription>
                    </div>
                    {participants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(index)}
                        className="text-[#c41e3a] hover:bg-[#c41e3a]/10 hover:text-[#c41e3a]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`nom-${index}`}
                          className="text-white/80"
                        >
                          Nom
                        </Label>
                        <Input
                          id={`nom-${index}`}
                          placeholder="Nom de famille"
                          value={participant.nom}
                          onChange={(e) =>
                            updateParticipant(index, "nom", e.target.value)
                          }
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`prenom-${index}`}
                          className="text-white/80"
                        >
                          Prénom
                        </Label>
                        <Input
                          id={`prenom-${index}`}
                          placeholder="Prénom"
                          value={participant.prenom}
                          onChange={(e) =>
                            updateParticipant(index, "prenom", e.target.value)
                          }
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`telephone-${index}`}
                        className="text-white/80"
                      >
                        Téléphone
                      </Label>
                      <Input
                        id={`telephone-${index}`}
                        type="tel"
                        placeholder="76 123 45 67"
                        value={participant.telephone}
                        onChange={(e) =>
                          updateParticipant(index, "telephone", e.target.value)
                        }
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/80">Type de billet</Label>
                      <RadioGroup
                        value={participant.type_ticket}
                        onValueChange={(value) =>
                          updateParticipant(
                            index,
                            "type_ticket",
                            value as TicketType
                          )
                        }
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                      >
                        {Object.values(TICKET_TYPES).map((ticket) => (
                          <Label
                            key={ticket.type}
                            htmlFor={`ticket-${index}-${ticket.type}`}
                            className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-all ${
                              participant.type_ticket === ticket.type
                                ? "border-[#c41e3a] bg-[#c41e3a]/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <RadioGroupItem
                              value={ticket.type}
                              id={`ticket-${index}-${ticket.type}`}
                              className="border-white/30 text-[#c41e3a]"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-[#f0c040]">
                                {ticket.price.toLocaleString("fr-FR")} FCFA
                              </p>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {participants.length < 10 && (
                <Button
                  variant="outline"
                  onClick={addParticipant}
                  className="mb-6 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un participant
                </Button>
              )}
            </motion.div>
          )}

          {/* Step 2: Activities */}
          {step === "activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-white/10 bg-[#0f2035]">
                <CardHeader>
                  <CardTitle className="text-white">
                    Sélection des activités
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Choisissez les activités pour chaque participant (optionnel)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {participants.map((participant, pIndex) => {
                    if (participant.type_ticket === "expo") return null

                    return (
                      <div key={pIndex} className="space-y-4">
                        <h4 className="font-medium text-white">
                          {participant.prenom} {participant.nom}
                          <span className="ml-2 text-sm text-white/50">
                            ({TICKET_TYPES[participant.type_ticket].name})
                          </span>
                        </h4>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {ACTIVITIES.map((activity) => (
                            <Label
                              key={activity.id}
                              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all ${
                                participant.activites.includes(activity.id)
                                  ? "border-[#5ba3e0] bg-[#5ba3e0]/10"
                                  : "border-white/10 hover:border-white/30"
                              }`}
                            >
                              <Checkbox
                                checked={participant.activites.includes(
                                  activity.id
                                )}
                                onCheckedChange={() =>
                                  toggleActivity(pIndex, activity.id)
                                }
                                className="mt-0.5 border-white/30 data-[state=checked]:border-[#5ba3e0] data-[state=checked]:bg-[#5ba3e0]"
                              />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-white/50">
                                  {activity.description}
                                </p>
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

          {/* Step 3: Payment */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="mb-6 border-white/10 bg-[#0f2035]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="h-5 w-5" />
                    Paiement via {PAYMENT_INFO.method}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Montant total:{" "}
                    <span className="font-orbitron font-bold text-[#f0c040]">
                      {totalAmount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#a01530] p-4">
                    <p className="text-sm font-medium text-white/80">
                      Numéro de paiement:
                    </p>
                    <p className="font-orbitron text-2xl font-bold text-white">
                      {PAYMENT_INFO.number}
                    </p>
                    <p className="text-sm text-white/70">
                      Nom: {PAYMENT_INFO.name}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium text-white">Instructions:</p>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-white/60">
                      {PAYMENT_INFO.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="screenshot" className="text-white/80">
                      Capture d&apos;écran du paiement
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setScreenshot(e.target.files?.[0] || null)
                        }
                        className="border-white/10 bg-white/5 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#c41e3a] file:px-4 file:py-2 file:font-medium file:text-white"
                      />
                    </div>
                    {screenshot && (
                      <p className="text-sm text-white/60">
                        Fichier sélectionné: {screenshot.name}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleUploadScreenshot}
                    disabled={!screenshot || uploadProgress}
                    className="w-full bg-gradient-to-r from-[#c41e3a] to-[#ff4757] py-6 text-white hover:from-[#a01530] hover:to-[#c41e3a]"
                  >
                    {uploadProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Envoyer la capture
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="mx-auto max-w-md border-white/10 bg-[#0f2035]">
                <CardContent className="pb-8 pt-8">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>

                  <h2 className="font-orbitron mb-2 text-2xl font-bold text-white">
                    Inscription reçue!
                  </h2>
                  <p className="mb-6 text-white/60">
                    Votre commande est en attente de validation. Vous recevrez
                    vos billets par email dès confirmation du paiement.
                  </p>

                  <div className="mb-6 rounded-lg bg-white/5 p-4">
                    <p className="text-sm text-white/50">Numéro de commande:</p>
                    <p className="font-mono text-sm text-white">{orderId}</p>
                  </div>

                  <div className="space-y-3">
                    <Link href={`/ticket/${orderId}`}>
                      <Button className="w-full bg-gradient-to-r from-[#c41e3a] to-[#ff4757] text-white">
                        Voir mes billets
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                      >
                        Retour à l&apos;accueil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step !== "confirmation" && step !== "payment" && (
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === "participants"}
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            <div className="text-right">
              <p className="mb-1 text-sm text-white/50">Total</p>
              <p className="font-orbitron text-xl font-bold text-[#f0c040]">
                {totalAmount.toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <Button
              onClick={nextStep}
              disabled={!allParticipantsValid || isSubmitting}
              className="bg-gradient-to-r from-[#c41e3a] to-[#ff4757] text-white hover:from-[#a01530] hover:to-[#c41e3a]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {step === "activities" || !showActivities ? "Payer" : "Suivant"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
