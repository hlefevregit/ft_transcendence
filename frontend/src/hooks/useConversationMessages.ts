// src/hooks/useConversationMessages.ts
import { useState, useEffect, useRef } from 'react'
import {
  getMessagesWith,
  sendMessageTo,
  markAsRead,
} from '../components/LiveChat/api'
import { useChatStore } from '../components/LiveChat/ChatContext'
import type { Message as DomainMessage, ChatUser } from '../types'

/**
 * On enrichit DomainMessage d’un champ senderPseudo
 * et on déduplique via seenIds
 */
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
} {
  const { recentContacts, resetUnread } = useChatStore()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const seenIds = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (otherId === null) return
    let active = true
    let since = 0

    // reset state à chaque conversation
    seenIds.current.clear()
    setMessages([])

    const enrich = (m: DomainMessage): MessageWithSender => ({
      ...m,
      senderPseudo:
        m.senderId === meId
          ? 'Moi'
          : recentContacts.find((u: ChatUser) => u.id === m.senderId)
              ?.username ?? 'Inconnu',
    })

    const addBatch = (batch: DomainMessage[]) => {
      const nouveaux = batch
        .filter(m => !seenIds.current.has(m.id))
        .map(enrich)
      if (nouveaux.length === 0) return
      nouveaux.forEach(m => seenIds.current.add(m.id))
      setMessages(prev => [...prev, ...nouveaux])
    }

    const poll = async () => {
      if (!active) return
      try {
        const { messages: batch, lastId } = await getMessagesWith(
          otherId,
          since
        )
        since = lastId
        const others = batch.filter(m => m.senderId !== meId)
        addBatch(others)
        if (others.length) {
          await markAsRead(otherId, lastId)
          resetUnread(otherId)
        }
      } catch (err) {
        console.error('Polling error', err)
      } finally {
        if (active) setTimeout(poll, pollIntervalMs)
      }
    }

    ;(async () => {
      try {
        const { messages: initBatch, lastId } = await getMessagesWith(
          otherId,
          0
        )
        since = lastId
        addBatch(initBatch.filter(m => m.senderId !== meId))
        await markAsRead(otherId, lastId)
        resetUnread(otherId)
      } catch (err) {
        console.error('Initial fetch error', err)
      }
      poll()
    })()

    return () => {
      active = false
    }
  }, [otherId, meId, pollIntervalMs, recentContacts, resetUnread])

  const sendMessage = async (text: string) => {
    if (otherId === null) return
    const m = await sendMessageTo(otherId, text)
    if (!m) return
    if (!seenIds.current.has(m.id)) {
      seenIds.current.add(m.id)
      setMessages(prev => [
        ...prev,
        {
          ...m,
          senderPseudo: 'Moi',
        },
      ])
    }
  }

  return { messages, sendMessage }
}
