// src/hooks/useConversationMessages.ts
import { useState, useEffect, useRef } from 'react'
import {
  getMessagesWith,
  sendMessageTo,
  markAsRead,
} from '../components/LiveChat/api'
import { useChatStore } from '../components/LiveChat/ChatStore'
import type { Message as DomainMessage } from '../types'

export interface MessageWithSender extends DomainMessage {
  senderPseudo: string
}

export function useConversationMessages(
  otherId: number | null,
  pollIntervalMs: number,
  meId: number
) {
  const { resetUnread, contactsById } = useChatStore()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [isBlocked, setIsBlocked] = useState(false)
  const seenIds = useRef<Set<number>>(new Set())
  const sinceId = useRef(0)

  async function refresh() {
    if (otherId === null) return

    // 1) on capture l'ancien sinceId
    const prevSince = sinceId.current

    try {
      // 2) on fetch depuis prevSince
      const { messages: batch, lastId } = await getMessagesWith(
        otherId,
        prevSince
      )
      setIsBlocked(false)
      // 3) on met à jour dès qu'on a le lastId
      sinceId.current = lastId

      if (prevSince === 0) {
        // – C'EST LE PREMIER FETCH –
        // getMessagesWith(…, 0) renvoie tout l'historique
        const allWithSender = batch.map(m => ({
          ...m,
          senderPseudo:
            m.senderId === meId
              ? 'Moi'
              : contactsById[m.senderId]?.username || 'Inconnu',
        }))
        // on scratche le set des IDs vus puis on le rebuild
        seenIds.current.clear()
        allWithSender.forEach(m => seenIds.current.add(m.id))
        // on remplace tout en une seule passe
        setMessages(allWithSender)
      } else {
        // – CE N'EST PAS LE PREMIER FETCH –
        // getMessagesWith(…, sinceId>0) renvoie seulement les nouveaux
        const nouveaux = batch.filter(m => !seenIds.current.has(m.id))
        if (nouveaux.length > 0) {
          const withSender = nouveaux.map(m => ({
            ...m,
            senderPseudo:
              m.senderId === meId
                ? 'Moi'
                : contactsById[m.senderId]?.username || 'Inconnu',
          }))
          withSender.forEach(m => seenIds.current.add(m.id))
          setMessages(prev => [...prev, ...withSender])
        }
      }

      // 4) mark-as-read si nécessaire (on peut le faire dans les deux cas)
      const justReceived = batch.some(m => m.senderId !== meId)
      if (justReceived) {
        await markAsRead(otherId, lastId)
        resetUnread(otherId)
      }
    } catch (err: any) {
      if (err.message === 'blocked') {
        setIsBlocked(true)
      } else {
        console.error('Erreur de refresh :', err)
      }
    }
  }

  useEffect(() => {
    // à chaque changement de chat, on reset les refs…
    seenIds.current.clear()
    sinceId.current = 0
    setIsBlocked(false)
    if (otherId === null) return

    // et on lance tout de suite le premier fetch + polling
    refresh()
    const timer = window.setInterval(refresh, pollIntervalMs)
    return () => clearInterval(timer)
  }, [otherId, pollIntervalMs])

  const sendMessage = async (text: string) => {
    if (otherId === null) return

    // est-ce notre toute première action ? (ni refresh ni send avant)
    const prevSince = sinceId.current

    try {
      const m = await sendMessageTo(otherId, text)
      setIsBlocked(false)
      if (m && !seenIds.current.has(m.id)) {
        seenIds.current.add(m.id)

        // on met à jour sinceId pour que refresh suivant ne rapatrie pas ce même message
        sinceId.current = m.id

        setMessages(prev => {
          const wrapped = { ...m, senderPseudo: 'Moi' }
          if (prevSince === 0) {
            // première action sur ce chat : on remplace
            return [wrapped]
          } else {
            // sinon on append
            return [...prev, wrapped]
          }
        })
      }
    } catch (err: any) {
      if (err.message === 'blocked') {
        setIsBlocked(true)
      } else {
        console.error('Erreur sendMessage :', err)
      }
    }
  }

  return { messages, sendMessage, refresh, isBlocked }
}
