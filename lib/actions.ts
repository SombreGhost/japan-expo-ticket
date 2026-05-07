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
    
    const eventDate = new Date('2026-05-9').getTime() 
    const today = new Date().getTime()
    const isEventDay = today >= eventDate

    let finalAmount = totalAmount;
    if (isEventDay) finalAmount += (500 * participants.length);
    
    const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        buyer_email: email || null,
        buyer_phone: phone,
        total_amount: finalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
        is_event_day: isEventDay
      })
    
    if (orderError) {
      console.error("Supabase Order Error:", orderError);
      return { success: false, error: orderError.message }
    }
    
    const participantsWithOrder = participants.map(p => ({
      order_id: orderId,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone || null,
      ticket_type: p.type_ticket,
      ticket_price: 0,
      qr_code: uuidv4(),
      activites: p.activites || [] 
    }))
    
    const { error: participantsError } = await supabase.from('participants').insert(participantsWithOrder)
    
    if (participantsError) {
      console.error("Supabase Participants Error:", participantsError);
      await supabase.from('orders').delete().eq('id', orderId)
      return { success: false, error: participantsError.message }
    }
    
    return { success: true, orderId }
  } catch (error: any) {
    console.error("Action Crash:", error);
    return { success: false, error: error.message || "Erreur critique du serveur" }
  }
}

// NOUVEAU : Création manuelle par l'admin avec Logs
export async function createAdminOrder(data: any) {
  try {
    const supabase = await createClient()
    const orderId = uuidv4()

    console.log("🚀 Lancement création manuel admin:", data)

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      buyer_email: data.email || null,
      buyer_phone: data.telephone || 'Admin',
      total_amount: data.amount,
      payment_method: data.payment_method,
      payment_status: 'validated' // <--- Changé de confirmed à validated pour éviter le rejet DB
    })

    if (orderError) {
      console.error("❌ Erreur Order:", orderError)
      return { success: false, error: "Erreur Order: " + orderError.message }
    }

    const { error: partError } = await supabase.from('participants').insert({
      order_id: orderId,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone || null,
      ticket_type: data.type_ticket,
      activites: data.activites || [], 
      qr_code: uuidv4(),
      is_checked_in: false
    })

    if (partError) {
      console.error("❌ Erreur Participant:", partError)
      await supabase.from('orders').delete().eq('id', orderId)
      return { success: false, error: "Erreur Participant: " + partError.message }
    }

    revalidatePath('/admin')
    return { success: true, orderId }
  } catch (error: any) {
    console.error("❌ Crash server createAdminOrder:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadPaymentScreenshot(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { success: false, error: "Aucun fichier" }

  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}.${fileExt}`
  const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, file, { upsert: true })
  if (uploadError) return { success: false, error: uploadError.message }

  const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)
  await supabase.from('orders').update({ payment_proof_url: publicUrlData.publicUrl }).eq('id', orderId)
  return { success: true }
}

export async function getAllOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select('*, participants(*)').order('created_at', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, orders: data }
}

export async function getOrderWithParticipants(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select('*, participants(*)').eq('id', orderId).single()
  if (error || !data) return { success: false, error: 'Commande introuvable' }
  const formattedOrder = { ...data, participants: data.participants.map((p: any) => ({ ...p, type_ticket: p.ticket_type })) }
  return { success: true, order: formattedOrder }
}

export async function getStats() {
  const supabase = await createClient()
  const { data: orders } = await supabase.from('orders').select('*')
  const { data: participants } = await supabase.from('participants').select('*')
  if (!orders || !participants) return { success: false, error: 'Erreur de récupération' }

  const confirmedOrders = orders.filter(o => o.payment_status === 'validated')
  const ticketsByType: Record<string, number> = {}
  participants.forEach(p => {
    const type = p.ticket_type || p.type_ticket;
    if (type) ticketsByType[type] = (ticketsByType[type] || 0) + 1
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
  return { success: true, participant: { ...data, type_ticket: data.ticket_type } }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const dbStatus = status === 'confirmed' ? 'validated' : status;
  const { error } = await supabase.from('orders').update({ payment_status: dbStatus }).eq('id', orderId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function checkInParticipant(participantId: string) {
  const supabase = await createClient()
  const { data: participant, error: fetchError } = await supabase.from('participants').select('*, orders(payment_status)').eq('id', participantId).single()
  if (fetchError || !participant) return { success: false, error: 'Participant introuvable' }

  const orderStatus = (participant as any).orders?.payment_status
  if (orderStatus !== 'confirmed' && orderStatus !== 'validated') {
    return { success: false, error: 'Paiement non confirmé', participant: { ...participant, type_ticket: participant.type_ticket } }
  }

  if (participant.is_checked_in) return { success: false, error: 'Déjà scanné', participant: { ...participant, type_ticket: participant.ticket_type } }

  const { data: updated, error: updateError } = await supabase.from('participants').update({ is_checked_in: true, scanned_at: new Date().toISOString() }).eq('id', participantId).select().single()
  if (updateError) return { success: false, error: updateError.message }
  
  revalidatePath('/admin')
  return { success: true, participant: { ...updated, type_ticket: updated.ticket_type } }
}

// CORRECTION FORTE : Suppression manuelle des participants avant la commande.
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  try {
    console.log("Tentative de suppression de :", orderId)
    // 1. Forcer la suppression des participants liés d'abord
    const { error: partError } = await supabase.from('participants').delete().eq('order_id', orderId)
    if (partError) {
      console.error("Erreur FK Participants:", partError)
      return { success: false, error: "Impossible de supprimer les participants: " + partError.message }
    }

    // 2. Ensuite on supprime la commande
    const { error: orderError } = await supabase.from('orders').delete().eq('id', orderId)
    if (orderError) {
      console.error("Erreur suppression commande:", orderError)
      return { success: false, error: "Impossible de supprimer la commande: " + orderError.message }
    }
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error("Crash lors de la suppression:", error)
    return { success: false, error: error.message }
  }
}