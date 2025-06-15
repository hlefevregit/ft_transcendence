// src/components/LiveChat/api.ts
import type { ChatUser, Message as DomainMessage } from '../../types'

const TOKEN_KEY = 'authToken'
function getAuthToken(): string {
  const t = localStorage.getItem(TOKEN_KEY)
  if (!t) throw new Error(`JWT manquant dans localStorage sous la clé "${TOKEN_KEY}"`)
  return t
}

// ——— Interfaces internes à l’API ———
interface APIMessage {
  id: number
  from: number
  to: number
  content: string
  createdAt: number
}

// ——— Contacts ———
export async function getContacts(): Promise<ChatUser[]> {
  const resp = await fetch('/api/friends', {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { friends } = await resp.json()
  return friends as ChatUser[]
}

// ——— Messages (polling) ———
export async function getMessagesWith(
  userId: number,
  sinceId: number
): Promise<{ messages: DomainMessage[]; lastId: number }> {
  const resp = await fetch(
    `/api/messages?with=${userId}&sinceId=${sinceId}`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  )
  if (!resp.ok) throw new Error(await resp.text())

  const { lastId, messages: apiMsgs } = (await resp.json()) as {
    lastId: number
    messages: APIMessage[]
  }

  const messages: DomainMessage[] = apiMsgs.map(m => ({
    id: m.id,
    senderId: m.from,
    receiverId: m.to,
    content: m.content,
    createdAt: m.createdAt,
  }))

  return { messages, lastId }
}

export async function sendMessageTo(
  userId: number,
  text: string
): Promise<DomainMessage> {
  const resp = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ to: userId, content: text }),
  })
  if (!resp.ok) throw new Error(await resp.text())

  const m = (await resp.json()) as APIMessage
  return {
    id: m.id,
    senderId: m.from,
    receiverId: m.to,
    content: m.content,
    createdAt: m.createdAt,
  }
}

// ——— Historique de parties ———
export interface MatchHistory {
  id: number
  userScore: number
  opponentScore: number
  result: 'win' | 'loss' | 'draw'
  date: string
}

export async function getUserHistory(pseudo: string): Promise<MatchHistory[]> {
  const resp = await fetch(`/api/users/${pseudo}/history`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { matches } = (await resp.json()) as { matches: MatchHistory[] }
  return matches
}

export async function getUserByPseudo(pseudo: string): Promise<ChatUser> {
  const resp = await fetch(`/api/users/${pseudo}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  return (await resp.json()) as ChatUser
}
