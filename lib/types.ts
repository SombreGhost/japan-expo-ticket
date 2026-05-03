// Les clés exactes de ta base de données !
export type TicketType = 'EXPO' | 'EXPO_CAT' | 'ALL_ACCESS';
export type PaymentStatus = 'pending' | 'pending_cash' | 'confirmed' | 'validated' | 'rejected';
export type PaymentMethod = 'wave' | 'orange' | 'cash';

export const activities = [
  { id: 'cat', name: 'Chasse au Trésor', req: ['EXPO_CAT', 'ALL_ACCESS'] },
  { id: 'cosplay', name: 'Concours Cosplay', req: ['ALL_ACCESS'] },
  { id: 'dessin', name: 'Concours de Dessin', req: ['ALL_ACCESS'] },
  { id: 'quizz', name: 'Quizz & Blind Test', req: ['ALL_ACCESS'] },
  { id: 'jeux', name: 'Tournois Jeux Vidéos', req: ['ALL_ACCESS'] },
] as const;

export interface TicketInfo {
  type: TicketType
  name: string
  price: number
  priceDayOf: number
  description: string
  features: string[]
  color: string
  bgGradient: string
}

export interface Participant {
  id?: string
  nom: string
  prenom: string
  telephone?: string // Rendu optionnel car parfois null
  type_ticket: TicketType
  activites: string[]
  screenshot_url?: string
  is_checked_in?: boolean
  scanned_at?: string
  order_id?: string
  created_at?: string
  updated_at?: string
  qr_code?: string // ✅ AJOUTÉ ICI
  ticket_price?: number // ✅ AJOUTÉ ICI
}

export interface Order {
  id?: string
  email?: string
  buyer_phone: string // ✅ AJOUTÉ ICI
  buyer_email?: string // ✅ AJOUTÉ ICI
  total_amount: number
  payment_method?: string // ✅ AJOUTÉ ICI
  payment_screenshot_url?: string
  payment_proof_url?: string // ✅ AJOUTÉ ICI
  payment_status: PaymentStatus // ✅ CORRIGÉ ICI POUR INCLURE 'validated'
  is_event_day?: boolean // ✅ AJOUTÉ ICI
  created_at?: string
  updated_at?: string
  participants?: Participant[]
}

export const TICKET_TYPES: Record<TicketType, TicketInfo> = {
  EXPO: {
    type: 'EXPO',
    name: 'EXPOSITIONS',
    price: 1000,
    priceDayOf: 1500,
    description: 'Accès aux expositions',
    features: [
      'Accès à toutes les expositions',
      'Zone merchandise',
      'Espace détente',
      'Food court'
    ],
    color: 'bg-[#c41e3a]',
    bgGradient: 'from-[#c41e3a] to-[#8b0000]'
  },
  EXPO_CAT: {
    type: 'EXPO_CAT',
    name: 'EXPO + CAT',
    price: 2000,
    priceDayOf: 2500,
    description: 'Expo + Concours & Activités & Tournois',
    features: [
      'Accès aux expositions',
      'Concours Cosplay',
      'Karaoké',
      'Dessin',
      'Jeux',
      'Quizz'
    ],
    color: 'bg-[#c41e3a]',
    bgGradient: 'from-[#c41e3a] to-[#8b0000]'
  },
  ALL_ACCESS: {
    type: 'ALL_ACCESS',
    name: 'ALL ACCESS',
    price: 3000,
    priceDayOf: 3500,
    description: 'Accès complet VIP',
    features: [
      'Tout EXPO + CAT inclus',
      'Chasse au Trésor',
      'Accès prioritaire',
      'lots à gagner',
      
    ],
    color: 'bg-[#c41e3a]',
    bgGradient: 'from-[#c41e3a] to-[#8b0000]'
  }
}

export const ACTIVITIES: { id: typeof activities[number]['id']; name: string; description: string; icon: string }[] = [
  {
    id: 'cosplay',
    name: 'Cosplays',
    description: 'Concours de cosplay avec des prix',
    icon: '👘'
  },
  {
    id: 'dessin',
    name: 'Dessin',
    description: 'Ateliers et concours de dessin manga',
    icon: '🎨'
  },
  {
    id: 'jeux',
    name: 'Jeux',
    description: 'Tournois et jeux vidéo',
    icon: '🎮'
  },
  {
    id: 'quizz',
    name: 'Quizz',
    description: 'Teste tes connaissances anime/manga',
    icon: '❓'
  },
  {
    id: 'cat',
    name: 'Chasse au Trésor',
    description: 'Trouve le One Piece caché!',
    icon: '🗺️'
  }
]

export const EVENT_INFO = {
  name: 'JAPAN EXPO',
  edition: '4e ÉDITION',
  organizer: 'Club Humanitaire ESP',
  date: '09 MAI',
  time: 'à partir de 9H',
  location: 'CAMPUS ESP',
  phone: '76 152 29 40',
  theme: 'One Piece - Egghead Arc',
  dayOfSurcharge: 500,
  surchargeNote: '+500F JOUR J SUR TOUS LES TICKETS'
}

export const PAYMENT_INFO = {
  method: 'Wave / Orange Money',
  number: '76 152 29 40',
  name: 'Club Humanitaire ESP',
  instructions: [
    'Ouvrez votre application Wave ou Orange Money',
    'Envoyez le montant total au numéro ci-dessus',
    'Prenez une capture d\'écran de la confirmation',
    'Uploadez la capture ci-dessous'
  ]
}