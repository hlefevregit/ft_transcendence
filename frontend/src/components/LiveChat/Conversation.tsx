import { useState, useEffect, useRef } from 'react'
import ChatInput from './ChatInput'
import { usePolling } from '../../hooks/usePolling'
import { ChatUser, Message } from '../../types'
import { getMessages, sendMessage } from '../LiveChat/mock'
import '../../styles/LiveChat/Conversation.css'

interface ConversationProps {
  user: ChatUser | null
  meId: number
  className?: string
}

export default function Conversation({
  user,
  meId,
  className = '',
}: ConversationProps) {
  // pour ne récupérer que les nouveaux messages
  const sinceRef = useRef<number>(Date.now())

  // polling toutes les 10 s
  const polled = usePolling<Message>(
    since => (user ? getMessages(user.id, since) : Promise.resolve([])),
    10_000
  )

  // état du fil de discussion
  const [messages, setMessages] = useState<Message[]>([])

  // 1) Au changement de user, on recharge tout l'historique
  useEffect(() => {
    if (!user) {
      setMessages([])
      return
    }
    getMessages(user.id, 0).then(history => {
      setMessages(history)
      sinceRef.current = Date.now()
    })
  }, [user?.id])

  // 2) Quand le polling renvoie des messages, on n'ajoute que les nouveaux
  useEffect(() => {
    if (polled.length === 0) return
    setMessages(prev => {
      const seen = new Set(prev.map(m => m.id))
      const fresh = polled.filter(m => !seen.has(m.id))
      return [...prev, ...fresh]
    })
    sinceRef.current = Date.now()
  }, [polled])

  // envoi instantané
  const handleSend = async (text: string) => {
    if (!user) return
    const m = await sendMessage(user.id, text)
    setMessages(prev => [...prev, m])
  }

  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-conversation__messages">
        {!user ? (
          <p className="chat-conversation__placeholder">Sélectionnez un contact</p>
        ) : messages.length === 0 ? (
          <p className="chat-conversation__placeholder">Aucune conversation</p>
        ) : (
          messages.map(m => (
            <div
              key={m.id}
              className={
                m.senderId === meId
                  ? 'chat-conversation__message chat-conversation__message--sent'
                  : 'chat-conversation__message chat-conversation__message--received'
              }
            >
              {m.content}
            </div>
          ))
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={!user} />
    </div>
  )
}
