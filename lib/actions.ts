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
  const supabase = await createClient()
  const orderId = uuidv4()
  
  const eventDate = new Date('2026-05-09').getTime() 
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
      payment_status: paymentMethod === 'cash' ? 'pending_cash' : 'pending',
      is_event_day: isEventDay
    })
  
  if (orderError) return { success: false, error: 'Erreur lors de la création de la commande' }
  
  const participantsWithOrder = participants.map(p => ({
    order_id: orderId,
    nom: p.nom,
    prenom: p.prenom,
    telephone: p.telephone || null,
    ticket_type: p.type_ticket, // Correspondance avec ta table Supabase
    ticket_price: 0,
    qr_code: uuidv4(),
    activites: p.activites || []
  }))
  
  const { error: participantsError } = await supabase.from('participants').insert(participantsWithOrder)
  
  if (participantsError) {
    await supabase.from('orders').delete().eq('id', orderId)
    return { success: false, error: "Erreur lors de l'ajout des participants" }
  }
  
  return { success: true, orderId }
}

export async function uploadPaymentScreenshot(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  
  if (!file) return { success: false, error: "Aucun fichier" }

  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, file)
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
  
  // Le select('*, participants(*)') permet de faire une jointure SQL automatique
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
  
  // Formatage pour correspondre aux attentes du frontend
  const formattedOrder = {
    ...data,
    participants: data.participants.map((p: any) => ({
      ...p,
      type_ticket: p.ticket_type // Re-mapping inverse pour le front
    }))
  }

  return { success: true, order: formattedOrder }
}

export async function getStats() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase.from('orders').select('*')
  const { data: participants } = await supabase.from('participants').select('*')

  if (!orders || !participants) return { success: false, error: 'Erreur de récupération des données' }

  const confirmedOrders = orders.filter(o => o.payment_status === 'confirmed')
  const ticketsByType: Record<string, number> = {}
  
  participants.forEach(p => {
    const type = p.ticket_type || p.type_ticket; // Sécurité de mapping
    ticketsByType[type] = (ticketsByType[type] || 0) + 1
  })

  return {
    success: true,
    stats: {
      totalOrders: orders.length,
      confirmedOrders: confirmedOrders.length,
      pendingOrders: orders.filter(o => o.payment_status !== 'confirmed').length,
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
  
  // Map ticket_type to type_ticket for the UI
  const participant = { ...data, type_ticket: data.ticket_type }
  
  return { success: true, participant }
}

// ==========================================
// 3. MUTATIONS : MISE À JOUR (Côté Admin)
// ==========================================

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', orderId)

  if (error) return { success: false, error: error.message }
  
  // Invalide le cache pour rafraîchir le dashboard instantanément
  revalidatePath('/admin')
  return { success: true }
}

export async function checkInParticipant(participantId: string) {
  const supabase = await createClient()
  
  // 1. Vérifier si le participant existe et n'est pas déjà scanné
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

  // 2. Mettre à jour le statut
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