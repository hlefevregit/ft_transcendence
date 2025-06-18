// src/components/LiveChat/Conversation.tsx
import { useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import { useConversationMessages } from '../../hooks/useConversationMessages'
import { useChatStore } from './ChatContext'
import type { ChatUser } from '../../types'
import '../../styles/LiveChat/Conversation.css'
import { getCurrentUser } from './api'

export default function Conversation({ className = '' }) {
  const { open, selectedUser } = useChatStore()
  const { id: meId } = getCurrentUser()

  const {
    messages,
    sendMessage,
    refresh,        // ← on récupère la fonction
  } = useConversationMessages(
    selectedUser?.id ?? null,
    1000,
    meId
  )

  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll automatique
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // 1) refresh à l’ouverture du panneau
  useEffect(() => {
    if (open && selectedUser) {
      refresh()
    }
  }, [open, selectedUser])

  // 2) refresh à chaque changement de conversation
  useEffect(() => {
    if (selectedUser) {
      refresh()
    }
  }, [selectedUser])

  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-conversation__messages" ref={containerRef}>
        {!selectedUser ? (
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
      <ChatInput onSend={sendMessage} disabled={!selectedUser} />
    </div>
  )
}
