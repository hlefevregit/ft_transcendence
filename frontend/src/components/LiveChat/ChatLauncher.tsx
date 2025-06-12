// src/components/LiveChat/ChatLauncher.tsx
import { useState } from 'react'
import ChatPanel from './ChatPanel'
import { MdMessage } from 'react-icons/md'
import '../../styles/LiveChat/ChatLauncher.css'

export default function ChatLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Affiche le panneau si open=true */}
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      {/* Bouton fixe bas-gauche pour ouvrir (disparu quand open=true) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-launcher-button"
          aria-label="Open chat"
        >
          <MdMessage size={24} />
        </button>
      )}
    </>
  )
}
