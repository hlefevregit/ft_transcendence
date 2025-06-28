// src/components/LiveChat/ChatLauncher.tsx
import { MdMessage } from 'react-icons/md'
import ChatPanel from './ChatPanel'
import '../../styles/LiveChat/ChatLauncher.css'
import { useChatStore } from './ChatStore'

export default function ChatLauncher() {
  const { open, setOpen } = useChatStore()

  return (
    <>
      {open ? (
        <ChatPanel onClose={() => setOpen(false)} />
      ) : (
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
