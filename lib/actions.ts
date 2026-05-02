'use server'

import { createClient } from '@/lib/supabase/server'
import { Order, Participant } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function createOrder(
  email: string,
  participants: Omit<Participant, 'id' | 'order_id' | 'created_at' | 'updated_at'>[],
  totalAmount: number
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient()
  
  const orderId = uuidv4()
  
  // Create the order first
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      email,
      total_amount: totalAmount,
      payment_status: 'pending'
    })
  
  if (orderError) {
    console.error('Order creation error:', orderError)
    return { success: false, error: 'Erreur lors de la création de la commande' }
  }
  
  // Create participants linked to this order
  const participantsWithOrder = participants.map(p => ({
    ...p,
    order_id: orderId,
    activites: JSON.stringify(p.activites)
  }))
  
  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participantsWithOrder)
  
  if (participantsError) {
    console.error('Participants creation error:', participantsError)
    // Rollback the order
    await supabase.from('orders').delete().eq('id', orderId)
    return { success: false, error: 'Erreur lors de l\'enregistrement des participants' }
  }
  
  return { success: true, orderId }
}

export async function uploadPaymentScreenshot(
  orderId: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient()
  
  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' }
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}-${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('payments')
    .upload(fileName, file)
  
  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: 'Erreur lors de l\'upload du fichier' }
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('payments')
    .getPublicUrl(fileName)
  
  // Update the order with the screenshot URL
  const { error: updateError } = await supabase
    .from('orders')
    .update({ payment_screenshot_url: publicUrl })
    .eq('id', orderId)
  
  if (updateError) {
    console.error('Update error:', updateError)
    return { success: false, error: 'Erreur lors de la mise à jour de la commande' }
  }
  
  return { success: true, url: publicUrl }
}

export async function getOrderWithParticipants(
  orderId: string
): Promise<{ success: boolean; order?: Order & { participants: Participant[] }; error?: string }> {
  const supabase = await createClient()
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  
  if (orderError || !order) {
    return { success: false, error: 'Commande non trouvée' }
  }
  
  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('*')
    .eq('order_id', orderId)
  
  if (participantsError) {
    return { success: false, error: 'Erreur lors de la récupération des participants' }
  }
  
  return { 
    success: true, 
    order: { ...order, participants: participants || [] } 
  }
}

export async function getParticipantById(
  participantId: string
): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()
  
  if (error || !data) {
    return { success: false, error: 'Participant non trouvé' }
  }
  
  return { success: true, participant: data }
}

export async function checkInParticipant(
  participantId: string
): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  const supabase = await createClient()
  
  // First check if already checked in
  const { data: existing, error: checkError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()
  
  if (checkError || !existing) {
    return { success: false, error: 'Participant non trouvé' }
  }
  
  if (existing.is_checked_in) {
    return { 
      success: false, 
      participant: existing,
      error: `Déjà scanné le ${new Date(existing.scanned_at).toLocaleString('fr-FR')}` 
    }
  }
  
  // Check if payment is confirmed
  const { data: order } = await supabase
    .from('orders')
    .select('payment_status')
    .eq('id', existing.order_id)
    .single()
  
  if (!order || order.payment_status !== 'confirmed') {
    return { 
      success: false, 
      participant: existing,
      error: 'Paiement non confirmé pour ce ticket' 
    }
  }
  
  // Update check-in status
  const { data, error } = await supabase
    .from('participants')
    .update({ 
      is_checked_in: true, 
      scanned_at: new Date().toISOString() 
    })
    .eq('id', participantId)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: 'Erreur lors du scan' }
  }
  
  return { success: true, participant: data }
}

export async function getAllOrders(): Promise<{ 
  success: boolean; 
  orders?: (Order & { participants: Participant[] })[]; 
  error?: string 
}> {
  const supabase = await createClient()
  
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (ordersError) {
    return { success: false, error: 'Erreur lors de la récupération des commandes' }
  }
  
  // Get all participants
  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('*')
  
  if (participantsError) {
    return { success: false, error: 'Erreur lors de la récupération des participants' }
  }
  
  // Group participants by order
  const ordersWithParticipants = orders?.map(order => ({
    ...order,
    participants: participants?.filter(p => p.order_id === order.id) || []
  })) || []
  
  return { success: true, orders: ordersWithParticipants }
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId)
  
  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour du statut' }
  }
  
  return { success: true }
}

export async function getStats(): Promise<{
  success: boolean;
  stats?: {
    totalOrders: number;
    confirmedOrders: number;
    pendingOrders: number;
    totalParticipants: number;
    checkedInParticipants: number;
    totalRevenue: number;
    ticketsByType: Record<string, number>;
  };
  error?: string;
}> {
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
  
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
  
  if (!orders || !participants) {
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
  
  const confirmedOrders = orders.filter(o => o.payment_status === 'confirmed')
  const ticketsByType: Record<string, number> = {}
  
  participants.forEach(p => {
    ticketsByType[p.type_ticket] = (ticketsByType[p.type_ticket] || 0) + 1
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
