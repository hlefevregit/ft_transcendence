import { useEffect, useState } from 'react'
import { ChatUser } from '../../types'
import { getContacts } from './mock'
import '../../styles/LiveChat/ChatList.css'

interface ChatListProps {
  onSelect: (user: ChatUser) => void
  className?: string
}

export default function ChatList({ onSelect, className = '' }: ChatListProps) {
  const [contacts, setContacts] = useState<ChatUser[]>([]) // liste des contacts

  useEffect(() => {
    // au montage, on récupère les contacts mockés
    getContacts().then(setContacts)
  }, [])

  return (
    <div className={`chat-list ${className}`}>
      {contacts.length === 0 ? (
        <p className="chat-list__empty">Aucun contact</p>
      ) : (
        contacts.map(user => (
          <div
            key={user.id}
            onClick={() => onSelect(user)}
            className="chat-list__item"
          >
            {user.username} <span className="chat-list__trophies">({user.trophies})</span>
          </div>
        ))
      )}
    </div>
  )
}
