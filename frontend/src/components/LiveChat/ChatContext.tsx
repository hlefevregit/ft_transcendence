// src/contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react'
import type { ChatUser, Message } from '../../types'
import { getMessagesWith } from './api'

interface ChatStore {
  // panel
  open: boolean
  setOpen: (b: boolean) => void

  // conversation courante
  selectedUser: ChatUser | null
  setSelectedUser: (u: ChatUser | null) => void

  // contacts récents
  recentContacts: ChatUser[]
  setRecentContacts: (c: ChatUser[]) => void

  // messages par conversation
  messages: Record<number, Message[]>
  setMessagesFor: (userId: number, ms: Message[]) => void

  // compteurs unread
  unreadCounts: Record<number, number>
  incrementUnread: (userId: number) => void
  resetUnread: (userId: number) => void
}

const ChatContext = createContext<ChatStore | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [recentContacts, setRecentContacts] = useState<ChatUser[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentContacts')! ) as ChatUser[]
    } catch {
      return []
    }
  })
  const [messages, setMessages] = useState<Record<number, Message[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('chatMessages')!) as Record<
        number,
        Message[]
      >
    } catch {
      return {}
    }
  })
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})

  // Persister recentContacts & messages & unreadCounts
  useEffect(
    () => localStorage.setItem('recentContacts', JSON.stringify(recentContacts)),
    [recentContacts]
  )
  useEffect(
    () => localStorage.setItem('chatMessages', JSON.stringify(messages)),
    [messages]
  )
  useEffect(
    () => localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts)),
    [unreadCounts]
  )

  const setMessagesFor = (userId: number, ms: Message[]) => {
    setMessages(prev => ({ ...prev, [userId]: ms }))
  }
  const incrementUnread = (userId: number) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1,
    }))
  }
  const resetUnread = (userId: number) => {
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }))
  }

  // Auto-ouverture : dès qu'un unreadCount passe >0
  useEffect(() => {
    if (!open) {
      for (const [uid, cnt] of Object.entries(unreadCounts)) {
        if (cnt > 0) {
          const id = Number(uid)
          const user = recentContacts.find(u => u.id === id)
          if (user) {
            setSelectedUser(user)
            setOpen(true)
            resetUnread(id)
          }
          break
        }
      }
    }
  }, [unreadCounts, open, recentContacts])

  // Polling global pour capter tous les messages entrants
  // On garde un sinceId par contact en ref
  const sinceRef = useRef<Record<number, number>>({})

  useEffect(() => {
    // on poll pour chaque contact récent
    const timers: Record<number, number> = {}
    for (const user of recentContacts) {
      const uid = user.id
      // initial since
      sinceRef.current[uid] = sinceRef.current[uid] || 0

      // setup polling
      timers[uid] = window.setInterval(async () => {
        try {
          const { messages: batch, lastId } = await getMessagesWith(
            uid,
            sinceRef.current[uid]
          )
          if (batch.length > 0) {
            // ajoute toujours aux messages
            setMessages(prev => ({
              ...prev,
              [uid]: [...(prev[uid] || []), ...batch],
            }))
            // si c'est pour la conv ouverte, on ne marque pas unread
            if (open && selectedUser?.id === uid) {
              // nothing, on lit direct
            } else {
              incrementUnread(uid)
            }
            sinceRef.current[uid] = lastId
          }
        } catch (err) {
          console.error('Polling error for', uid, err)
        }
      }, 10_000)
    }
    return () => {
      // cleanup tous les timers
      Object.values(timers).forEach(clearInterval)
    }
  }, [recentContacts, open, selectedUser])

  return (
    <ChatContext.Provider
      value={{
        open,
        setOpen,
        selectedUser,
        setSelectedUser,
        recentContacts,
        setRecentContacts,
        messages,
        setMessagesFor,
        unreadCounts,
        incrementUnread,
        resetUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatStore(): ChatStore {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatStore must be inside ChatProvider')
  return ctx
}
