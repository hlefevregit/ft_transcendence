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

  // si blocage : on renvoie un batch vide silencieusement
  if (resp.status === 403) {
    throw new Error('blocked')
  }
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
): Promise<DomainMessage | null> {
  const resp = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ to: userId, content: text }),
  })

  // si blocage : on ne renvoie rien et on n'affiche pas d’erreur
  if (resp.status === 403) {
    throw new Error('blocked')
  }
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

// ——— Blocage / Déblocage ———
export async function blockUser(userId: number): Promise<void> {
  const resp = await fetch(`/api/users/${userId}/block`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
}

// APRÈS : POST vers /unblock
export async function unblockUser(userId: number): Promise<void> {
  const resp = await fetch(`/api/users/${userId}/unblock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
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

// ——— Marquer comme lu ———
export async function markAsRead(
  otherId: number,
  lastReadId: number
): Promise<void> {
  const resp = await fetch(`/api/conversations/${otherId}/read`, {
    method: 'POST',                           // ← Utilisation de POST
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ lastReadId }),
  })
  if (!resp.ok) throw new Error(await resp.text())
}


// ——— Récupérer tous les compteurs de non-lus ———
export async function getUnreadCounts(): Promise<Record<number, number>> {
  const resp = await fetch('/api/conversations/unreadCounts', {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { unreadCounts } = await resp.json() as {
    unreadCounts: Record<number, number>
  }
  return unreadCounts
}

// ——— Récupérer la liste des IDs bloqués par un user ———
export async function getBlockedUsers(userId: number): Promise<number[]> {
  const resp = await fetch(`/api/users/${userId}/blocked`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { blockedUsers } = (await resp.json()) as { blockedUsers: number[] }
  return blockedUsers
}

export function getCurrentUser(): { id: number } {
  const token = localStorage.getItem('authToken')
  if (!token) throw new Error('No auth token')
  const [, payloadBase64] = token.split('.')
  const payload = JSON.parse(atob(payloadBase64))
  return { id: Number(payload.id) }  // ou payload.userId selon ce que vous encodez
}

export async function getRecentContacts(): Promise<ChatUser[]> {
  const resp = await fetch('/api/conversations/recent', {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { recentContacts } = (await resp.json()) as {
    recentContacts: ChatUser[]
  }
  return recentContacts
}

export async function getRecentContactIds(): Promise<number[]> {
  const resp = await fetch('/api/conversations/recentIds', {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { ids } = (await resp.json()) as { ids: number[] }
  return ids
}

export async function getUsersByIds(ids: number[]): Promise<ChatUser[]> {
  const resp = await fetch('/api/users/batch', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ ids }),
  })
  if (!resp.ok) throw new Error(await resp.text())
  const { users } = (await resp.json()) as { users: ChatUser[] }
  return users
}
