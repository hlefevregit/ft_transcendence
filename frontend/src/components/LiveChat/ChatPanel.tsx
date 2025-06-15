// src/components/LiveChat/ChatPanel.tsx
import { useState, KeyboardEvent } from 'react'
import ChatList from './ChatList'
import Conversation from './Conversation'
import type { ChatUser } from '../../types'
import { getUserByPseudo } from './api'
import '../../styles/LiveChat/ChatPanel.css'

interface ChatPanelProps {
  contacts: ChatUser[]
  onSelect: (user: ChatUser) => void
  onClose: () => void
}

export default function ChatPanel({
  contacts,
  onSelect,
  onClose,
}: ChatPanelProps) {
  // utilisateur actuellement en cours de discussion
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  // valeur tapée dans le champ
  const [searchText, setSearchText] = useState('')
  // message d'erreur à afficher si pseudo introuvable
  const [error, setError] = useState('')

  const handleSelect = (user: ChatUser) => {
    onSelect(user)
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
      setSearchText('')  // on ne vide l'input qu'en cas de succès
    } catch {
      setError("Utilisateur introuvable")
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
        {error && (
          <p className="chat-panel__error">{error}</p>
        )}
        <ChatList
          contacts={contacts}
          onSelect={handleSelect}
          className="chat-panel__list"
        />
      </div>

      <div className="chat-panel__content">
        <div className="chat-panel__header">
          <span className="chat-panel__title">
            {selectedUser ? selectedUser.username : ''}
          </span>
          <button
            onClick={onClose}
            className="chat-panel__close-button"
            aria-label="Fermer le chat"
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
