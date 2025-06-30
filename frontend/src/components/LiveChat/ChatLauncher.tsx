// src/components/LiveChat/ChatLauncher.tsx
import React from 'react'
import { MdMessage } from 'react-icons/md'
import * as game from '@/libs/pongLibs'
import ChatPanel from './ChatPanel'
import { useChatStore } from './ChatStore'
import '../../styles/LiveChat/ChatLauncher.css'

interface ChatLauncherProps {
  gameState: number
  gameModesRef: React.RefObject<game.gameModes>
  statesRef:   React.RefObject<game.states>
  setGameModeTrigger: React.Dispatch<React.SetStateAction<number>>
  roomIdRef: React.RefObject<string>
}

export default function ChatLauncher({
  gameState,
  gameModesRef,
  statesRef,
  setGameModeTrigger,
  roomIdRef
}: ChatLauncherProps) {
  const { open, setOpen } = useChatStore()

  return (
    <>
      {/* Toujours monté pour que la logique tourne en tâche de fond */}
      <ChatPanel
        visible={open}
        onClose={() => setOpen(false)}
        gameState={gameState}
        gameModesRef={gameModesRef}
        statesRef={statesRef}
        setGameModeTrigger={setGameModeTrigger}
        roomIdRef={roomIdRef}
      />

      {/* Bouton qui s’affiche uniquement quand le panneau est fermé */}
      <button
        onClick={() => setOpen(true)}
        className="chat-launcher-button"
        aria-label="Ouvrir le chat"
        style={{ display: open ? 'none' : 'block' }}
      >
        <MdMessage size={24} />
      </button>
    </>
  )
}
