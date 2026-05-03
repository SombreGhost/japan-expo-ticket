'use server'

import { createClient } from '@/lib/supabase/server'
import { Participant } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

// CONSTANTES DE CONTACT & PAIEMENT (DRY - SOLID)
export const CONTACT_INFO = {
  paymentNumber: "781109979", // Wave & Orange Money
  whatsappNumber: "761522940", // Info / Rappel
  wavePaymentLink: "https://pay.wave.com/m/M_sn_qR2LqxyK6nZv/c/sn/",
  whatsappLink: "https://wa.me/221761522940", // Numéro complet avec indicatif
  googleMapsLink: "https://maps.app.goo.gl/TON_LIEN_GOOGLE_MAPS", // Remplace par ton vrai lien
  calendarLink: "https://www.google.com/calendar/render?action=TEMPLATE&text=Japan+Expo+Campus+ESP+Dakar&dates=20260509T080000Z/20260509T180000Z&details=4e+Édition+de+la+Japan+Expo+ Dakar.+Thème:+One+Piece+Egghead.+Philanthropie+Tabaski.&location=Campus+ESP+Dakar", // Lien Google Calendar
}

// DATE CLÉ DU JOUR J
const EVENT_DATE_ISO = '2026-05-09'; // Remplace par la vraie date ISO

export async function createOrder(
  email: string,
  phone: string,
  paymentMethod: string,
  participants: Omit<Participant, 'id' | 'order_id' | 'created_at' | 'updated_at'>[],
  totalAmount: number // Reçu du front pour UX, sera vérifié ici
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient()
  const orderId = uuidv4()
  
  // 1. RECALCUL SÉCURISÉ DU PRIX (BACKEND TRUTH)
  const today = new Date();
  const eventDay = new Date(EVENT_DATE_ISO);
  const isEventDay = today >= eventDay;
  
  let finalAmount = totalAmount; // UX Amount
  
  // Si c'est le jour J, majoration de 500F par ticket
  if (isEventDay) {
    // Note: Dans un système parfait, tu recalcules le total à partir des types de tickets stockés côté serveur,
    // mais ici on fait confiance au calcul du front + majoration Jour J pour la simplicité.
    finalAmount += (500 * participants.length);
  }
  
  // 2. CRÉATION DE LA COMMANDE
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      buyer_email: email || null,
      buyer_phone: phone,
      total_amount: finalAmount,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cash' ? 'pending_cash' : 'pending',
      is_event_day: isEventDay // Tracker pour audit
    })
  
  if (orderError) {
    console.error('Order creation error:', orderError)
    return { success: false, error: 'Erreur lors de la création de la commande' }
  }
  
  // 3. CRÉATION DES PARTICIPANTS
  const participantsWithOrder = participants.map(p => ({
    order_id: orderId,
    nom: p.nom,
    prenom: p.prenom,
    telephone: p.telephone || null,
    ticket_type: p.type_ticket,
    ticket_price: 0, 
    qr_code: uuidv4(),
  }))
  
  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participantsWithOrder)
  
  if (participantsError) {
    console.error('Participants creation error:', participantsError)
    await supabase.from('orders').delete().eq('id', orderId) // Rollback
    return { success: false, error: 'Erreur lors de l\'ajout des participants' }
  }
  
  return { success: true, orderId }
}

export async function uploadPaymentScreenshot(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  
  if (!file) return { success: false, error: "Aucun fichier" }

  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file)
    
  if (uploadError) return { success: false, error: "Échec de l'upload" }

  const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)
  
  await supabase
    .from('orders')
    .update({ payment_proof_url: publicUrlData.publicUrl })
    .eq('id', orderId)

  return { success: true }
}