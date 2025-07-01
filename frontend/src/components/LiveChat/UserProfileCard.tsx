// src/components/LiveChat/UserProfileCard.tsx
import React, { FC, useEffect, useState, useRef } from 'react'
import {
  getUserHistory,
  getBlockedUsers,
  blockUser,
  unblockUser,
  getCurrentUser,
} from './api'
import type { ChatUser } from '../../types'
import '../../styles/LiveChat/UserProfileCard.css'

// Cache par userId pour ne fetcher qu'une seule fois par utilisateur
const profileCache = new Map<
  number,
  { history: any[]; isBlocked: boolean }
>()

interface UserProfileCardProps {
  user: ChatUser
  onClose: () => void
  style?: React.CSSProperties
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  onClose,
  style,
}) => {
  const [history, setHistory] = useState<any[]>([])
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)

  const { id: meId } = getCurrentUser()
  const cacheKey = user.id
  const lastCachedId = useRef<number | null>(null)

  useEffect(() => {
    let active = true

    // Si déjà en cache et même user, on réutilise
    if (profileCache.has(cacheKey) && lastCachedId.current === cacheKey) {
      const c = profileCache.get(cacheKey)!
      setHistory(c.history)
      setIsBlocked(c.isBlocked)
      return
    }

    lastCachedId.current = cacheKey

    // fetch isBlocked
    getBlockedUsers(meId)
      .then(list => {
        if (!active) return
        const blocked = list.includes(user.id)
        setIsBlocked(blocked)
        // stocke dans le cache
        const prev = profileCache.get(cacheKey) ?? { history: [], isBlocked: blocked }
        profileCache.set(cacheKey, { history: prev.history, isBlocked: blocked })
      })
      // .catch(console.error)

    // fetch history
    getUserHistory(user.username)
      .then(allHistory => {
        if (!active) return
        const h = allHistory.slice(0, 5)
        setHistory(h)
        // stocke dans le cache
        const prev = profileCache.get(cacheKey) ?? { history: h, isBlocked }
        profileCache.set(cacheKey, { history: h, isBlocked: prev.isBlocked })
      })
      // .catch(console.error)

    return () => {
      active = false
    }
  }, [user.id, user.username, meId, cacheKey])

  const toggleBlock = async () => {
    setBlockLoading(true)
    try {
      if (isBlocked) {
        await unblockUser(user.id)
        setIsBlocked(false)
        profileCache.set(cacheKey, { history, isBlocked: false })
      } else {
        await blockUser(user.id)
        setIsBlocked(true)
        profileCache.set(cacheKey, { history, isBlocked: true })
      }
    } catch (err) {
      // console.error(err)
    } finally {
      setBlockLoading(false)
    }
  }

  return (
    <div
      id={`profile-card-${user.id}`}
      className="user-profile-card visible"
      onMouseLeave={onClose}
      style={style}
    >
      <div className="user-profile-card__header">
        <span className="user-profile-card__pseudo">{user.username}</span>
        <div className="user-profile-card__actions">
          {user.id !== meId && (
            <button
              className="user-profile-card__block-btn"
              onClick={toggleBlock}
              disabled={blockLoading}
            >
              {isBlocked ? 'Débloquer' : 'Bloquer'}
            </button>
          )}
        </div>
      </div>
      <div className="user-profile-card__body">
        {history.length === 0 ? (
          <p className="no-history">Aucune partie enregistrée</p>
        ) : (
          <div className="user-profile-card__matches">
            {history.map(m => (
              <div
                key={m.id}
                className={`match-card ${
                  m.result === 'win'
                    ? 'win-card'
                    : m.result === 'loss'
                    ? 'loss-card'
                    : 'draw-card'
                }`}
              >
                <span className="player-score">{m.userScore}</span>
                <div className="match-separator" />
                <span className="opponent-score">{m.opponentScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
