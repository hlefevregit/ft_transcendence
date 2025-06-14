// src/components/LiveChat/UserProfileCard.tsx
import { FC, useEffect } from 'react'
import { ChatUser } from '../../types'
import { MdEmojiEvents } from 'react-icons/md'
import '../../styles/LiveChat/UserProfileCard.css'

interface Match {
  result: 'win' | 'loss' | 'draw'
  playerScore: number
  opponentScore: number
}

interface UserProfileCardProps {
  user: ChatUser
  recentMatches: Match[]
  onClose: () => void
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  recentMatches,
  onClose,
}) => {
  useEffect(() => {
    const node = document.getElementById(`profile-card-${user.id}`)
    node?.classList.add('visible')
  }, [user.id])

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
        <div className="user-profile-card__matches">
          {recentMatches.map((m, i) => (
            <div
              key={i}
              className={`match-card ${
                m.result === 'win'
                  ? 'win-card'
                  : m.result === 'loss'
                  ? 'loss-card'
                  : 'draw-card'
              }`}
            >
              <span className="player-score">{m.playerScore}</span>
              <div className="match-separator" />
              <span className="opponent-score">{m.opponentScore}</span>
            </div>
          ))}
        </div>
        <div className="user-profile-card__trophies">
          <span className="stat-label">{user.trophies}</span>
          <MdEmojiEvents className="trophy-icon" />
        </div>
      </div>
    </div>
  )
}
