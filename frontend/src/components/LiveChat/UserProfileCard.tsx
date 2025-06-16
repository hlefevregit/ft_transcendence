// src/components/LiveChat/UserProfileCard.tsx
import { FC, useEffect, useState } from 'react'
import { ChatUser } from '../../types'
import { MdEmojiEvents } from 'react-icons/md'
import {
  getUserHistory,
  blockUser,
  unblockUser,
  getBlockedUsers,
  MatchHistory,
} from './api'
import '../../styles/LiveChat/UserProfileCard.css'

interface UserProfileCardProps {
  user: ChatUser
  onClose: () => void
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  onClose,
}) => {
  const [history, setHistory] = useState<MatchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)

  const meId = 1  // Remplacez par l'ID de l'utilisateur courant si vous avez un contexte d'auth

  useEffect(() => {
    let active = true
    setLoading(true)

    // On lance en parallèle la récupération de l'historique et de l'état de blocage
    Promise.all([
      getUserHistory(user.username),
      getBlockedUsers(meId),
    ])
      .then(([allHistory, blockedList]) => {
        if (!active) return
        setHistory(allHistory.slice(0, 5))
        setIsBlocked(blockedList.includes(user.id))
      })
      .catch(err => {
        console.error('Erreur récupération profil :', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.username, user.id])

  const toggleBlock = async () => {
    setBlockLoading(true)
    try {
      if (isBlocked) {
        await unblockUser(user.id)
        setIsBlocked(false)
      } else {
        await blockUser(user.id)
        setIsBlocked(true)
      }
      onClose()
    } catch (err) {
      console.error('Erreur blocage/déblocage :', err)
    } finally {
      setBlockLoading(false)
    }
  }

  return (
    <div
      id={`profile-card-${user.id}`}
      className="user-profile-card visible"
      onMouseLeave={onClose}
    >
      <div className="user-profile-card__header">
        <span className="user-profile-card__pseudo">{user.username}</span>
        <button
          className="user-profile-card__block-btn"
          onClick={toggleBlock}
          disabled={blockLoading}
        >
          {isBlocked ? 'Débloquer' : 'Bloquer'}
        </button>
      </div>

      <div className="user-profile-card__body">
        {loading ? (
          <p className="user-profile-card__loading">Chargement…</p>
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

        <div className="user-profile-card__trophies">
          <span className="stat-label">{user.trophies}</span>
          <MdEmojiEvents className="trophy-icon" />
        </div>
      </div>
    </div>
  )
}
