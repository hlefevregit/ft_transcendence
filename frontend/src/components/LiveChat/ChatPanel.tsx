// src/components/LiveChat/ChatPanel.tsx
import { useState, KeyboardEvent } from 'react'
import ChatList from './ChatList'
import Conversation from './Conversation'
import type { ChatUser } from '../../types'
import { getUserByPseudo } from './api'
import { useChatStore } from './ChatContext'
import '../../styles/LiveChat/ChatPanel.css'

interface ChatPanelProps {
  onClose: () => void
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const {
    recentContacts,
    setRecentContacts,
    selectedUser,
    setSelectedUser,
  } = useChatStore()

  const [searchText, setSearchText] = useState('')
  const [error, setError] = useState('')

  const handleSelect = (user: ChatUser) => {
    // si nouveau contact, on l'ajoute à recentContacts
    if (!recentContacts.find(u => u.id === user.id)) {
      setRecentContacts([...recentContacts, user])
    }
    setSelectedUser(user)
    setError('')
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const pseudo = searchText.trim()
    if (!pseudo) return

    try {
      const user = await getUserByPseudo(pseudo)
      handleSelect(user)
      setSearchText('')
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
        <ChatList
          contacts={recentContacts}
          onSelect={handleSelect}
          className="chat-panel__list"
        />
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
