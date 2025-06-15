// src/hooks/useConversationMessages.ts
import { useEffect, useRef } from 'react'
import { getMessagesWith, sendMessageTo } from '../components/LiveChat/api'
import { useChatStore } from '../components/LiveChat/ChatContext'
import type { Message } from '../types'

export function useConversationMessages(
  userId: number | null,
  pollIntervalMs: number,
  meId: number
): {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
} {
  const { messages, setMessagesFor } = useChatStore()
  const sinceRef = useRef<Record<number, number>>({})

  useEffect(() => {
    if (userId === null) return
    let active = true
    const uid = userId

    // 1) chargement initial
    getMessagesWith(uid, 0).then(({ messages: all, lastId }) => {
      if (!active) return
      setMessagesFor(uid, all)
      sinceRef.current[uid] = lastId
    })

    // 2) polling
    const id = setInterval(() => {
      const since = sinceRef.current[uid] ?? 0
      getMessagesWith(uid, since)
        .then(({ messages: batch, lastId }) => {
          if (!active || batch.length === 0) return
          // on n’ajoute que ceux de l’autre
          const others = batch.filter(m => m.senderId !== meId)
          if (others.length) {
            setMessagesFor(uid, [...(messages[uid] || []), ...others])
          }
          sinceRef.current[uid] = lastId
        })
        .catch(console.error)
    }, pollIntervalMs)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [userId, pollIntervalMs, meId, messages, setMessagesFor])

  const sendMessage = async (text: string) => {
    if (userId === null) return
    const msg = await sendMessageTo(userId, text)
    setMessagesFor(userId, [...(messages[userId] || []), msg])
  }

  return {
    messages: userId !== null ? messages[userId] || [] : [],
    sendMessage,
  }
}
