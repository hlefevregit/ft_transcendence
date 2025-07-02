// src/components/LiveChat/ChatList.tsx
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useChatStore } from '@/components/LiveChat/ChatStore'
import { UserProfileCard } from '@/components/LiveChat/UserProfileCard'
import type { ChatUser } from '@/types'
import '@/styles/LiveChat/ChatList.css'

// Timings
const OPEN_DELAY = 1000
const CLOSE_DELAY = 200

export default function ChatList({ className = '' }: { className?: string }) {
  const {
    recentContactIds,
    contactsById,
    unreadCounts,
    setSelectedUserId,
  } = useChatStore()

  const [profileUser, setProfileUser] = useState<ChatUser | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  )

  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)

  const startHover = (user: ChatUser, rect: DOMRect) => {
    // si on était en train de fermer, on annule
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    // lance l'ouverture après 1s
    openTimer.current = window.setTimeout(() => {
      setProfileUser(user)
      setHoverPos({ x: rect.right, y: rect.top })
    }, OPEN_DELAY)
  }

  const cancelHover = () => {
    // annule l'ouverture programmée
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
    // lance la fermeture après CLOSE_DELAY
    if (!closeTimer.current) {
      closeTimer.current = window.setTimeout(() => {
        setProfileUser(null)
        setHoverPos(null)
      }, CLOSE_DELAY)
    }
  }

  // Pop-over dans un portal, avec ses propres handlers
  const Popover = () =>
    profileUser && hoverPos
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              top: hoverPos.y,
              left: hoverPos.x,
              zIndex: 10000,
            }}
            onMouseEnter={() => {
              // annule la fermeture tant qu’on reste sur le popover
              if (closeTimer.current) {
                clearTimeout(closeTimer.current)
                closeTimer.current = null
              }
            }}
            onMouseLeave={cancelHover}
          >
            <UserProfileCard
              user={profileUser}
              onClose={() => {
                setProfileUser(null)
                setHoverPos(null)
              }}
            />
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div className={`chat-list ${className}`} style={{ overflow: 'visible' }}>
        {recentContactIds.length === 0 ? (
          <p className="chat-list__empty">Aucun contact</p>
        ) : (
          recentContactIds.map(id => {
            const user = contactsById[id]
            if (!user) return null
            return (
              <div
                key={id}
                className="chat-list__item"
                onClick={() => setSelectedUserId(id)}
                onMouseEnter={e =>
                  startHover(user, e.currentTarget.getBoundingClientRect())
                }
                onMouseLeave={cancelHover}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                <span>{user.username}</span>
                {unreadCounts[id] > 0 && (
                  <span className="chat-list__unread">
                    {unreadCounts[id]}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
      <Popover />
    </>
  )
}
