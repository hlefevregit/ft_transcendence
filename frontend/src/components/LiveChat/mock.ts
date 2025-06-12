// src/api/mock.ts

import { ChatUser, Message, Invitation } from '../../types'

// ————————————————————————————————————————————————
// Simulations de données en mémoire
// ————————————————————————————————————————————————

let _msgId = 1
let _invId = 1

// Contacts fictifs
export const mockContacts: ChatUser[] = [
  { id: 2, username: 'Alice',   trophies: 3 },
  { id: 3, username: 'Bob',     trophies: 5 },
  { id: 4, username: 'Charlie Chapplin', trophies: 1 },
]

// Messages fictifs
export const mockMessages: Message[] = [
  {
    id: _msgId++,
    content: 'Salut Alice !',
    senderId: 1,
    receiverId: 2,
    createdAt: new Date(Date.now() - 60_000).toISOString(), // il y a 1 min
  },
  {
    id: _msgId++,
    content: 'Hey ! Ça va ?',
    senderId: 2,
    receiverId: 1,
    createdAt: new Date(Date.now() - 30_000).toISOString(), // il y a 30 s
  },
]

// Invitations fictives (sera vidé après lecture)
export let mockInvitations: Invitation[] = []

// Utilitaire de délai
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ISO string “maintenant”
const now = () => new Date().toISOString()

// ————————————————————————————————————————————————
// Fonctions mock API
// ————————————————————————————————————————————————

/**
 * Récupère la liste des contacts disponibles.
 */
export async function getContacts(): Promise<ChatUser[]> {
  await delay(200)    // simule latence réseau
  return mockContacts
}

/**
 * Récupère les messages échangés avec `withId` après le timestamp `since`.
 * @param withId Identifiant de l'interlocuteur
 * @param since  Millisecondes depuis epoch
 */
export async function getMessages(
  withId: number,
  since: number
): Promise<Message[]> {
  await delay(200)
  // renvoie tous les messages pertinents (ignorant since ici pour démonstration)
  return mockMessages.filter(
    m =>
      ((m.senderId === 1 && m.receiverId === withId) ||
       (m.senderId === withId && m.receiverId === 1)) &&
      new Date(m.createdAt).getTime() > since
  )
}

/**
 * Envoie un message à `toId`, l'ajoute à mockMessages et renvoie l'objet créé.
 */
export async function sendMessage(
  toId: number,
  content: string
): Promise<Message> {
  await delay(100)
  const m: Message = {
    id: _msgId++,
    content,
    senderId: 1,
    receiverId: toId,
    createdAt: now(),
  }
  mockMessages.push(m)
  return m
}

/**
 * Récupère les invitations Pong adressées à l'utilisateur (id=1) après `since`.
 * Génère aléatoirement une invitation pour la démonstration.
 */
export async function getInvitations(since: number): Promise<Invitation[]> {
  await delay(200)
  // simulate one invitation ~5% of calls
  if (Math.random() < 0.05) {
    mockInvitations.push({
      id: _invId++,
      fromId: mockContacts[Math.floor(Math.random() * mockContacts.length)].id,
      toId: 1,
      game: 'pong',
      createdAt: now(),
    })
  }
  // renvoyer et vider la liste
  const invs = mockInvitations.slice()
  mockInvitations = []
  return invs.filter(inv => new Date(inv.createdAt).getTime() > since)
}
