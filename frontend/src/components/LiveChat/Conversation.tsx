// src/components/LiveChat/Conversation.tsx
import { useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import { useConversationMessages } from '../../hooks/useConversationMessages'
import type { ChatUser } from '../../types'
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
  const { messages, sendMessage } = useConversationMessages(
    user?.id ?? null,
    10_000,
    meId
  )

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-conversation__messages" ref={containerRef}>
        {!user ? (
          <p className="chat-conversation__placeholder">
            Sélectionnez un contact
          </p>
        ) : messages.length === 0 ? (
          <p className="chat-conversation__placeholder">
            Aucune conversation
          </p>
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
      <ChatInput onSend={sendMessage} disabled={!user} />
    </div>
  )
}
