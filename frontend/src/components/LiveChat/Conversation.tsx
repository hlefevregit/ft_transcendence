// src/components/LiveChat/Conversation.tsx
import { useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import { useConversationMessages } from '../../hooks/useConversationMessages'
import { useChatStore } from './ChatStore'
import '../../styles/LiveChat/Conversation.css'
import { getCurrentUser } from './api'

export default function Conversation({ className = '' }) {
  const { open, selectedUserId, contactsById } = useChatStore()
  const selectedUser = selectedUserId != null ? contactsById[selectedUserId] : null
  const { id: meId } = getCurrentUser()

  const { messages, sendMessage, refresh, isBlocked } =
    useConversationMessages(selectedUserId, 1000, meId)

  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll auto
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Refresh à l’ouverture et au changement de conversation
  useEffect(() => {
    if (open && selectedUserId != null && !isBlocked) {
      refresh()
    }
  }, [open, selectedUserId, isBlocked])

  useEffect(() => {
    if (!isBlocked && selectedUserId != null) {
      refresh()
    }
  }, [selectedUserId, isBlocked])

  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-conversation__messages" ref={containerRef}>
        {!selectedUser ? (
          <p className="chat-conversation__placeholder">
            Sélectionnez un contact
          </p>
        ) : isBlocked ? (
          <p className="chat-conversation__blocked">
            Blocked.
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
      <ChatInput
        onSend={sendMessage}
        disabled={!selectedUserId || isBlocked}
      />
    </div>
  )
}
