// src/components/LiveChat/ChatList.tsx
import { useState, useEffect, useRef } from 'react'
import { ChatUser } from '../../types'
import { getContacts } from './mock'
import { UserProfileCard } from './UserProfileCard'
import '../../styles/LiveChat/ChatList.css'

export default function ChatList({
  onSelect,
  className = '',
}: {
  onSelect: (user: ChatUser) => void
  className?: string
}) {
  const [contacts, setContacts] = useState<ChatUser[]>([])
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getContacts().then(setContacts)
  }, [])

  const startHover = (user: ChatUser) => {
    hoverTimer.current = setTimeout(() => {
      setProfileUser(user)
    }, 1000)
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
            style={{ position: 'relative' }}
          >
            {user.username}{' '}
            <span className="chat-list__trophies">({user.trophies})</span>

            {profileUser?.id === user.id && (
              <UserProfileCard
                user={user}
                recentMatches={[
                  { result: 'win', playerScore: 10, opponentScore: 8 },
                  { result: 'loss', playerScore: 7, opponentScore: 9 },
                  { result: 'win', playerScore: 11, opponentScore: 6 },
                  { result: 'draw', playerScore: 5, opponentScore: 5 },
                  { result: 'win', playerScore: 12, opponentScore: 4 },
                ]}
                onClose={() => setProfileUser(null)}
              />
            )}
          </div>
        ))
      )}
    </div>
  )
}
