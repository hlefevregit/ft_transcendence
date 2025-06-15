// src/components/LiveChat/ChatLauncher.tsx
import { useState } from 'react'
import { MdMessage } from 'react-icons/md'
import ChatPanel from './ChatPanel'
import type { ChatUser } from '../../types'        // ← ajouté
import '../../styles/LiveChat/ChatLauncher.css'
import { useChatStore } from './ChatContext'

export default function ChatLauncher() {
  const [open, setOpen] = useState(false)
  const { recentContacts, setRecentContacts } = useChatStore()

  const handleSelect = (user: ChatUser) => {
    if (!recentContacts.find(u => u.id === user.id)) {
      setRecentContacts([...recentContacts, user])
    }
    setOpen(true)
  }

  return (
    <>
      {open && (
        <ChatPanel
          contacts={recentContacts}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-launcher-button"
          aria-label="Ouvrir le chat"
        >
          <MdMessage size={24} />
        </button>
      )}
    </>
  )
}
