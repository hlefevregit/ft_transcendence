// src/components/LiveChat/LiveChat.tsx
import React, { useRef } from 'react'
import * as game from '@/libs/pongLibs'
import ChatLauncher from './ChatLauncher'

export interface LiveChatProps {
  gameState?: number
  gameModesRef?: React.RefObject<game.gameModes>
  statesRef?:   React.RefObject<game.states>
  setGameModeTrigger?: React.Dispatch<React.SetStateAction<number>>
  roomIdRef?: React.RefObject<string>
}

export default function LiveChat(props: LiveChatProps) {
  // Hooks en haut, inconditionnellement
  const defaultGameModesRef = useRef<game.gameModes>(game.gameModes.none)
  const defaultStatesRef   = useRef<game.states>  (game.states.main_menu)
  const defaultRoomIdRef   = useRef<string>('')

  // Si la prop est fournie, on l’utilise, sinon on tombe sur la ref par défaut
  const gameModesRef       = props.gameModesRef      ?? defaultGameModesRef
  const statesRef          = props.statesRef         ?? defaultStatesRef
  const setGameModeTrigger = props.setGameModeTrigger ?? (() => {})
  const roomIdRef          = props.roomIdRef         ?? defaultRoomIdRef
  const gameState          = props.gameState         ?? game.states.main_menu

  return (
    <ChatLauncher
      gameState={gameState}
      gameModesRef={gameModesRef}
      statesRef={statesRef}
      setGameModeTrigger={setGameModeTrigger}
      roomIdRef={roomIdRef}
    />
  )
}
