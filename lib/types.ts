export type TicketType = 'expo' | 'expo_cat' | 'all_access'

export type Activity = 
  | 'cosplays'
  | 'karaoke'
  | 'dessin'
  | 'jeux'
  | 'quizz'
  | 'chasse_tresor'

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
  telephone: string
  type_ticket: TicketType
  activites: Activity[]
  screenshot_url?: string
  is_checked_in?: boolean
  scanned_at?: string
  order_id?: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id?: string
  email: string
  total_amount: number
  payment_screenshot_url?: string
  payment_status: 'pending' | 'confirmed' | 'rejected'
  created_at?: string
  updated_at?: string
  participants?: Participant[]
}

export const TICKET_TYPES: Record<TicketType, TicketInfo> = {
  expo: {
    type: 'expo',
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
  expo_cat: {
    type: 'expo_cat',
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
  all_access: {
    type: 'all_access',
    name: 'ALL ACCESS',
    price: 3000,
    priceDayOf: 3500,
    description: 'Accès complet VIP',
    features: [
      'Tout EXPO + CAT inclus',
      'Chasse au Trésor',
      'Accès prioritaire',
      'Goodies exclusifs',
      'Zone VIP'
    ],
    color: 'bg-[#c41e3a]',
    bgGradient: 'from-[#c41e3a] to-[#8b0000]'
  }
}

export const ACTIVITIES: { id: Activity; name: string; description: string; icon: string }[] = [
  {
    id: 'cosplays',
    name: 'Cosplays',
    description: 'Concours de cosplay avec des prix',
    icon: '👘'
  },
  {
    id: 'karaoke',
    name: 'Karaoké',
    description: 'Chante tes anime openings préférés',
    icon: '🎤'
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
    id: 'chasse_tresor',
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
