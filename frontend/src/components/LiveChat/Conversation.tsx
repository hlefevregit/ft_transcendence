// src/components/LiveChat/Conversation.tsx
import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ChatInput from '@/components/LiveChat/ChatInput'
import { useConversationMessages } from '@/hooks/useConversationMessages'
import { useInvitations, Invite } from '@/hooks/useInvitations'
import { useChatStore } from '@/components/LiveChat/ChatStore'
import '@/styles/LiveChat/Conversation.css'
import { getCurrentUser } from '@/components/LiveChat/api'
import * as game from '@/libs/pongLibs'
import * as baby from '@/libs/babylonLibs'
import { useTranslation } from 'react-i18next';

interface ConversationProps {
  className?: string
  states: React.RefObject<game.states>
}

export default function Conversation({ className = '', states }: ConversationProps) {
  const { t } = useTranslation();
  const { open, selectedUserId, contactsById } = useChatStore()
  const selectedUser = selectedUserId != null ? contactsById[selectedUserId] : null
  const { id: meId } = getCurrentUser()

  const { messages, sendMessage, refresh, isBlocked } =
    useConversationMessages(selectedUserId, 1000, meId)

  // Step 4: polling invitations
  const invites = useInvitations(1000)
  // Only keep the invite from the currently selected user
  const currentInvite = invites.find(
    (inv: Invite) => inv.inviterId === selectedUserId
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // auto-scroll on new messages
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // refresh on open or user change
  useEffect(() => {
    if (open && selectedUserId != null && !isBlocked) {
      refresh()
    }
  }, [open, selectedUserId, isBlocked, refresh])

  // refresh on user change or unblock
  useEffect(() => {
    if (!isBlocked && selectedUserId != null) {
      refresh()
    }
  }, [selectedUserId, isBlocked, refresh])

  // Handler for the “Rejoindre” button
  const handleJoin = async (roomId: string) => {
    // console.log('handleJoin appelé avec roomId=', roomId)
    try {
      navigate(`/pong?joinRoomId=${roomId}`)
 
      // setState()
    } catch (err) {
      // console.error('Erreur handleJoin:', err)
      alert('Impossible de rejoindre la partie.')
    }
  }


  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-conversation__messages" ref={containerRef}>
        {!selectedUser ? (
          <p className="chat-conversation__placeholder">
            {t('select_user')}
          </p>
        ) : isBlocked ? (
          <p className="chat-conversation__blocked">t{('blocked')}</p>
        ) : messages.length === 0 ? (
          <p className="chat-conversation__placeholder">
            {t('no_messages_placeholder')}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.senderId === meId
                  ? 'chat-conversation__message chat-conversation__message--sent'
                  : 'chat-conversation__message chat-conversation__message--received'
              }
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      {currentInvite && (
        <div className="chat-invite-banner">
          <span>
            {contactsById[currentInvite.inviterId]?.username ||
              t('somebody')}{' '}
            {t('invites_you_to_join')}
          </span>
          <button onClick={() => handleJoin(currentInvite.roomId)}>
            {t('join')}
          </button>
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={!selectedUserId || isBlocked}
      />
    </div>
  )
}
