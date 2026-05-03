'use server'

import { createClient } from '@/lib/supabase/server'
import { Participant } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. MUTATIONS : CRÉATION (Côté Utilisateur)
// ==========================================

export async function createOrder(
  email: string,
  phone: string,
  paymentMethod: string,
  participants: Omit<Participant, 'id' | 'order_id' | 'created_at' | 'updated_at'>[],
  totalAmount: number
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const orderId = uuidv4()
    
    // Règle du jour J : majoration (17 Mai 2025)
    const eventDate = new Date('2026-05-9').getTime() 
    const today = new Date().getTime()
    const isEventDay = today >= eventDate

    let finalAmount = totalAmount;
    if (isEventDay) {
      finalAmount += (500 * participants.length);
    }
    
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        buyer_email: email || null,
        buyer_phone: phone,
        total_amount: finalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'pending', // 'pending_cash' n'est pas dans ton CHECK ARRAY Supabase, on force 'pending'
        is_event_day: isEventDay
      })
    
    if (orderError) {
      console.error("Supabase Order Error:", orderError);
      return { success: false, error: 'Erreur lors de la création de la commande' }
    }
    
    const participantsWithOrder = participants.map(p => ({
      order_id: orderId,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone || null,
      ticket_type: p.type_ticket, // L'UI envoie 'EXPO', 'EXPO_CAT', ou 'ALL_ACCESS'
      ticket_price: 0,
      qr_code: uuidv4(),
      activites: p.activites || [] // Envoi propre au format JSONB
    }))
    
    const { error: participantsError } = await supabase.from('participants').insert(participantsWithOrder)
    
    if (participantsError) {
      console.error("Supabase Participants Error:", participantsError);
      await supabase.from('orders').delete().eq('id', orderId)
      return { success: false, error: "Erreur lors de l'ajout des participants" }
    }
    
    return { success: true, orderId }
  } catch (error) {
    console.error("Action Crash:", error);
    return { success: false, error: "Erreur critique du serveur" }
  }
}

// NOUVELLE FONCTION POUR L'ADMIN : Vente sur place
export async function adminCreateOrder(
  nom: string, prenom: string, type_ticket: string, montant: number, activites: string[]
) {
  const supabase = await createClient()
  const orderId = uuidv4()
  
  // L'admin crée un paiement cash directement "validated"
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    buyer_phone: 'SUR PLACE',
    total_amount: montant,
    payment_method: 'cash',
    payment_status: 'validated' // OK avec la DB
  })

  if (orderError) return { success: false, error: orderError.message }
  
  const { data, error } = await supabase.from('participants').insert({
    order_id: orderId,
    nom, prenom,
    ticket_type: type_ticket,
    ticket_price: montant,
    qr_code: uuidv4(),
    activites: activites,
    is_checked_in: true // Check-in immédiat sur place
  }).select().single()
  
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true, participant: data }
}

export async function uploadPaymentScreenshot(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  
  if (!file) return { success: false, error: "Aucun fichier" }

  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, file, { upsert: true })
  if (uploadError) return { success: false, error: "Échec de l'upload" }

  const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)
  
  await supabase.from('orders').update({ payment_proof_url: publicUrlData.publicUrl }).eq('id', orderId)
  return { success: true }
}

// ==========================================
// 2. QUERIES : LECTURE (Côté Admin & Succès)
// ==========================================

export async function getAllOrders() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, participants(*)')
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, orders: data }
}

export async function getOrderWithParticipants(orderId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, participants(*)')
    .eq('id', orderId)
    .single()

  if (error || !data) return { success: false, error: 'Commande introuvable' }
  
  const formattedOrder = {
    ...data,
    participants: data.participants.map((p: any) => ({
      ...p,
      type_ticket: p.ticket_type
    }))
  }

  return { success: true, order: formattedOrder }
}

export async function getStats() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase.from('orders').select('*')
  const { data: participants } = await supabase.from('participants').select('*')

  if (!orders || !participants) return { success: false, error: 'Erreur de récupération des données' }

  // CORRECTION : On vérifie 'validated' au lieu de 'confirmed'
  const confirmedOrders = orders.filter(o => o.payment_status === 'validated')
  const ticketsByType: Record<string, number> = {}
  
  participants.forEach(p => {
    const type = p.ticket_type || p.type_ticket;
    if (type) {
        ticketsByType[type] = (ticketsByType[type] || 0) + 1
    }
  })

  return {
    success: true,
    stats: {
      totalOrders: orders.length,
      confirmedOrders: confirmedOrders.length,
      pendingOrders: orders.filter(o => o.payment_status === 'pending').length,
      totalParticipants: participants.length,
      checkedInParticipants: participants.filter(p => p.is_checked_in).length,
      totalRevenue: confirmedOrders.reduce((sum, o) => sum + o.total_amount, 0),
      ticketsByType
    }
  }
}

export async function getParticipantById(participantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('participants').select('*').eq('id', participantId).single()

  if (error || !data) return { success: false, error: 'Participant introuvable' }
  
  const participant = { ...data, type_ticket: data.ticket_type }
  
  return { success: true, participant }
}

// ==========================================
// 3. MUTATIONS : MISE À JOUR (Côté Admin)
// ==========================================

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  // CORRECTION DE SÉCURITÉ : L'UI Admin de V0 envoyait 'confirmed'.
  // On le mappe de force sur 'validated' pour respecter le CHECK ARRAY de Supabase.
  const dbStatus = status === 'confirmed' ? 'validated' : status;

  const { error } = await supabase.from('orders').update({ payment_status: dbStatus }).eq('id', orderId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function checkInParticipant(participantId: string) {
  const supabase = await createClient()
  
  const { data: participant, error: fetchError } = await supabase
    .from('participants')
    .select('is_checked_in, ticket_type, nom, prenom, telephone')
    .eq('id', participantId)
    .single()

  if (fetchError || !participant) return { success: false, error: 'Participant introuvable' }
  if (participant.is_checked_in) return { 
    success: false, 
    error: 'Déjà scanné', 
    participant: { ...participant, type_ticket: participant.ticket_type } 
  }

  const { data: updated, error: updateError } = await supabase
    .from('participants')
    .update({ 
      is_checked_in: true, 
      scanned_at: new Date().toISOString() 
    })
    .eq('id', participantId)
    .select()
    .single()

  if (updateError) return { success: false, error: updateError.message }
  
  revalidatePath('/admin/scan')
  
  return { 
    success: true, 
    participant: { ...updated, type_ticket: updated.ticket_type } 
  }
}
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  // Grâce au CASCADE ci-dessus, on a juste besoin de supprimer l'order
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}