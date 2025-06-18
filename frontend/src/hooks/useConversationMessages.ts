// src/hooks/useConversationMessages.ts
import { useState, useEffect, useRef } from 'react'
import {
  getMessagesWith,
  sendMessageTo,
  markAsRead,
} from '../components/LiveChat/api'
import { useChatStore } from '../components/LiveChat/ChatContext'
import type { Message as DomainMessage, ChatUser } from '../types'

export interface MessageWithSender extends DomainMessage {
  senderPseudo: string
}

export function useConversationMessages(
  otherId: number | null,
  pollIntervalMs: number,
  meId: number
): {
  messages: MessageWithSender[]
  sendMessage: (text: string) => Promise<void>
  refresh: () => Promise<void>
} {
  const { resetUnread, recentContacts } = useChatStore()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const seenIds = useRef<Set<number>>(new Set())
  const sinceId = useRef(0)

  async function refresh() {
    if (otherId === null) return
    try {
      const { messages: batch, lastId } = await getMessagesWith(
        otherId,
        sinceId.current
      )
      sinceId.current = lastId

      const nouveaux = batch.filter(m => !seenIds.current.has(m.id))
      if (!nouveaux.length) return

      const withSender: MessageWithSender[] = nouveaux.map(m => ({
        ...m,
        senderPseudo:
          m.senderId === meId
            ? 'Moi'
            : recentContacts.find(u => u.id === m.senderId)?.username ||
              'Inconnu',
      }))

      withSender.forEach(m => seenIds.current.add(m.id))
      setMessages(prev => [...prev, ...withSender])

      if (withSender.some(m => m.senderId !== meId)) {
        await markAsRead(otherId, lastId)
        resetUnread(otherId)
      }
    } catch (err) {
      console.error('Erreur de refresh :', err)
    }
  }

  useEffect(() => {
    // **1) reset complet à chaque changement de otherId**
    seenIds.current.clear()
    setMessages([])
    sinceId.current = 0

    // 2) si pas de destinataire, on s'arrête là
    if (otherId === null) return

    // 3) fetch immédiat pour la nouvelle conversation
    refresh()

    // 4) polling toutes les pollIntervalMs
    const timer = window.setInterval(refresh, pollIntervalMs)
    return () => {
      clearInterval(timer)
    }
  }, [otherId, pollIntervalMs]) // on ne liste toujours que otherId + intervalle

  const sendMessage = async (text: string) => {
    if (otherId === null) return
    const m = await sendMessageTo(otherId, text)
    if (!m || seenIds.current.has(m.id)) return
    seenIds.current.add(m.id)
    setMessages(prev => [...prev, { ...m, senderPseudo: 'Moi' }])
  }

  return { messages, sendMessage, refresh }
}
