// src/components/LiveChat/ChatPanel.tsx
import React, { useState, KeyboardEvent } from 'react'
import ChatList from './ChatList'
import Conversation from './Conversation'
import type { ChatUser } from '../../types'
import { getUserByPseudo } from './api'
import { useChatStore } from './ChatStore'
import '../../styles/LiveChat/ChatPanel.css'

interface ChatPanelProps {
  onClose: () => void
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const {
    contactsById,
    selectedUserId,
    setSelectedUserId,
    addRecentContactId,
    addContact,
  } = useChatStore()

  const selectedUser: ChatUser | null =
    selectedUserId != null ? contactsById[selectedUserId] : null

  const [searchText, setSearchText] = useState('')
  const [error, setError] = useState('')

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const pseudo = searchText.trim()
    if (!pseudo) return

    try {
      const user = await getUserByPseudo(pseudo)
      addContact(user)
      addRecentContactId(user.id)
      setSelectedUserId(user.id)
      setSearchText('')
      setError('')
    } catch {
      setError('Utilisateur introuvable')
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__sidebar">
        <input
          type="text"
          placeholder="Nouveau message à..."
          className="chat-panel__search"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
        />
        {error && <p className="chat-panel__error">{error}</p>}
        {/* Plus de props : ChatList lit tout du contexte */}
        <ChatList className="chat-panel__list" />
      </div>

      <div className="chat-panel__content">
        <div className="chat-panel__header">
          <span className="chat-panel__title">
            {selectedUser?.username || ''}
          </span>
          <button
            onClick={onClose}
            className="chat-panel__close-button"
            aria-label="Fermer le chat"
          >
            ✕
          </button>
        </div>

        <Conversation className="chat-panel__conversation" />
      </div>
    </div>
  )
}
