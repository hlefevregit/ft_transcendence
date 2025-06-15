// src/components/LiveChat/ChatList.tsx
import { useState, useRef } from 'react'
import type { ChatUser } from '../../types'
import { useChatStore } from './ChatContext'
import '../../styles/LiveChat/ChatList.css'

interface ChatListProps {
  contacts: ChatUser[]
  onSelect: (user: ChatUser) => void
  className?: string
}

export default function ChatList({
  contacts,
  onSelect,
  className = '',
}: ChatListProps) {
  const { unreadCounts } = useChatStore()
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startHover = (user: ChatUser) => {
    hoverTimer.current = setTimeout(() => setProfileUser(user), 1000)
  }
  const cancelHover = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  return (
    <div className={`chat-list ${className}`}>
      {contacts.length === 0 ? (
        <p className="chat-list__empty">Aucun contact</p>
      ) : (
        contacts.map(user => (
          <div
            key={user.id}
            className="chat-list__item"
            onClick={() => onSelect(user)}
            onDoubleClick={() => setProfileUser(user)}
            onMouseEnter={() => startHover(user)}
            onMouseLeave={() => {
              cancelHover()
              setProfileUser(null)
            }}
            style={{ position: 'relative', overflow: 'visible' }}
          >
            <span>{user.username}</span>
            {unreadCounts[user.id] > 0 && (
              <span className="chat-list__unread">
                {unreadCounts[user.id]}
              </span>
            )}
          </div>
        ))
      )}
    </div>
)
}
