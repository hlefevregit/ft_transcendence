// src/components/LiveChat/ChatPanel.tsx
import { useState, KeyboardEvent } from 'react'
import ChatList from './ChatList'
import Conversation from './Conversation'
import { ChatUser } from '../../types'
import '../../styles/LiveChat/ChatPanel.css'

interface ChatPanelProps {
  onClose: () => void
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const name = e.currentTarget.value.trim()
      if (name) {
        setSelectedUser({ id: 0, username: name, trophies: 0 })
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__sidebar">
        <input
          type="text"
          placeholder="New message to..."
          className="chat-panel__search"
          onKeyDown={handleKeyDown}
        />
        <ChatList className="chat-panel__list" onSelect={setSelectedUser} />
      </div>

      <div className="chat-panel__content">
        <div className="chat-panel__header">
          <span className="chat-panel__title">
            {selectedUser ? selectedUser.username : ''}
          </span>
            <button
            onClick={onClose}
            className="chat-panel__close-button"
            aria-label="Close chat"
            >
            ✕
            </button>
        </div>

        <Conversation
          user={selectedUser}
          meId={1}
          className="chat-panel__conversation"
        />
      </div>
    </div>
  )
}
