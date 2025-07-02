// src/components/LiveChat/ChatPanel.tsx
import React, { useState, KeyboardEvent, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ChatList from '@/components/LiveChat/ChatList'
import Conversation from '@/components/LiveChat/Conversation'
import type { ChatUser } from '@/types'
import { getUserByPseudo, getCurrentUser } from '@/components/LiveChat/api'
import { useChatStore } from '@/components/LiveChat/ChatStore'
import axios from 'axios'
import '@/styles/LiveChat/ChatPanel.css'
import * as game from '@/libs/pongLibs'
import { useTranslation } from 'react-i18next';


interface ChatPanelProps {
  visible: boolean
  onClose: () => void
  gameState: number
  gameModesRef: React.RefObject<game.gameModes>
  statesRef: React.RefObject<game.states>
  setGameModeTrigger: React.Dispatch<React.SetStateAction<number>>
  roomIdRef: React.RefObject<string>
}

export default function ChatPanel({
  visible,
  onClose,
  gameState,
  gameModesRef,
  statesRef,
  setGameModeTrigger,
  roomIdRef
}: ChatPanelProps) {
  const { id: meId } = getCurrentUser()
  const {
    contactsById,
    selectedUserId,
    setSelectedUserId,
    addRecentContactId,
    addContact
  } = useChatStore()

  const selectedUser: ChatUser | null =
    selectedUserId != null
      ? contactsById[selectedUserId]
      : null

  const [searchText, setSearchText] = useState('')
  const [error, setError] = useState('')
  const [pendingInviteeId, setPendingInviteeId] = useState<number | null>(null)
  const [hasUpdatedInvite, setHasUpdatedInvite] = useState(false)
  const { t } = useTranslation();

  const clearPendingInviteeId = () => {
    setPendingInviteeId(null)
    setHasUpdatedInvite(false)
  }

  const isInvited = selectedUser?.id === pendingInviteeId
  const isMainMenu = gameState === game.states.main_menu
  const canInvite = isMainMenu && selectedUser && selectedUser.id !== meId
  const location = useLocation()
  const isInPong = location.pathname.startsWith('/pong')
  const prevGameStateRef = React.useRef<number>(gameState)


  /** Envoi de la première invitation */
  const handleInvite = () => {
    if (!selectedUser || selectedUser.id === meId) return
    // passe en online
    gameModesRef.current = game.gameModes.online
    setGameModeTrigger(prev => prev + 1)
    // écran de configuration
    statesRef.current = game.states.game_settings
    setPendingInviteeId(selectedUser.id)
  }

  // Envoi l'invitation uniquement quand on est bien en game_settings
  useEffect(() => {
    if (
      pendingInviteeId != null &&
      gameState === game.states.game_settings
    ) {
      axios.post(
        '/api/invitations',
        { inviteeId: pendingInviteeId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      ).catch(err => {
        // console.error('Erreur invitation :', err)
        alert("Impossible d'envoyer l'invitation.")
      })
    }
  }, [gameState, pendingInviteeId])


  useEffect(() => {
    const prev = prevGameStateRef.current
    const curr = gameState

    // 1) première entrée dans hosting_waiting_players → confirmation
    if (
      pendingInviteeId != null &&
      curr === game.states.hosting_waiting_players &&
      !hasUpdatedInvite
    ) {
      axios
        .post(
          '/api/invitations/confirm',
          { inviteeId: pendingInviteeId, roomId: roomIdRef.current },
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        )
        .then(() => setHasUpdatedInvite(true))
        .catch(err => {})
    }

    // 2) hosting_waiting_players → game_settings → reset (sans supprimer)
    if (
      hasUpdatedInvite &&
      prev === game.states.hosting_waiting_players &&
      curr === game.states.game_settings
    ) {
      axios
        .post(
          '/api/invitations/reset',
          { inviteeId: pendingInviteeId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        )
        .then(() => {
          // console.log('Invitation remise à zéro')
          setHasUpdatedInvite(false)
        })
        .catch(err => {})
    }

    // 3) hosting_waiting_players → autre état (hors game_settings) → suppression
    if (
      curr !== game.states.hosting_waiting_players &&
      curr !== game.states.game_settings
    ) {
      // console.log('State actuel (curr):', curr)
      axios
        .post(
          '/api/invitations/delete',
          { inviteeId: pendingInviteeId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        )
        .then(() => {
          // console.log('Invitation supprimée')
          setPendingInviteeId(null)
          setHasUpdatedInvite(false)
        })
        .catch(err => {})
    }

    prevGameStateRef.current = curr
  }, [gameState, pendingInviteeId, hasUpdatedInvite, roomIdRef])

  // Supprime toutes mes invitations si je ne suis pas sur /pong
  useEffect(() => {
    if (!location.pathname.startsWith('/pong')) {
      axios.post(
        '/api/invitations/deleteAllMine',
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      ).then(() => {
        setPendingInviteeId(null)
        setHasUpdatedInvite(false)
        // console.log('Toutes mes invitations supprimées (auto, plus sur /pong)')
      }).catch(err => {})
    }
  }, [location.pathname])


  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const pseudo = searchText.trim()
    if (!pseudo) return

    try {
      const user = await getUserByPseudo(pseudo)
      addContact(user)
      addRecentContactId(user.id)
      setSelectedUserId(user.id)
      setSearchText('')
      setError('')
      setPendingInviteeId(null)
    } catch {
      setError('Utilisateur introuvable')
    }
  }

  return (
    <div
      className="chat-panel"
      style={{ display: visible ? 'flex' : 'none' }}
    >
      <div className="chat-panel__sidebar">
        <input
          type="text"
          placeholder={t('new_message_placeholder')}
          className="chat-panel__search"
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
        />
        {error && <p className="chat-panel__error">{error}</p>}
        <ChatList className="chat-panel__list" />
      </div>

      <div className="chat-panel__content">
        <div className="chat-panel__header">
          {canInvite && isInPong && (
            <button
              className="chat-panel__invite-button"
              onClick={handleInvite}
              disabled={isInvited}
            >
              {isInvited ? t('invited') : t('invite')}
            </button>
          )}
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
