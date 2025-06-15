// src/components/LiveChat/UserProfileCard.tsx
import { FC, useEffect, useState } from 'react'
import { ChatUser } from '../../types'
import { MdEmojiEvents } from 'react-icons/md'
import { getUserHistory, MatchHistory } from './api'
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

  useEffect(() => {
    let active = true
    setLoading(true)

    getUserHistory(user.username)
      .then((all: MatchHistory[]) => {
        if (!active) return
        setHistory(all.slice(0, 5))
      })
      .catch((err: unknown) => {
        console.error('Erreur récupération historique :', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.username])

  return (
    <div
      id={`profile-card-${user.id}`}
      className="user-profile-card"
      onMouseLeave={onClose}
    >
      <div className="user-profile-card__header">
        <span className="user-profile-card__pseudo">{user.username}</span>
        <button
          className="user-profile-card__block-btn"
          onClick={() => alert(`Utilisateur ${user.username} bloqué !`)}
        >
          Bloquer
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
