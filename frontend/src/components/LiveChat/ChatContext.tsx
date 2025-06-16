// src/components/LiveChat/ChatContext.tsx
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
  // panneau ouvert ou fermé
  open: boolean
  setOpen: (b: boolean) => void

  // conversation en cours
  selectedUser: ChatUser | null
  setSelectedUser: (u: ChatUser | null) => void

  // contacts récents
  recentContacts: ChatUser[]
  setRecentContacts: (c: ChatUser[]) => void

  // messages par conversation
  messages: Record<number, Message[]>
  setMessagesFor: (userId: number, ms: Message[]) => void

  // compteurs de non-lus
  unreadCounts: Record<number, number>
  incrementUnread: (userId: number) => void
  resetUnread: (userId: number) => void

  // vider tout au logout/login
  clearStore: () => void
}

const ChatContext = createContext<ChatStore | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)

  const [recentContacts, setRecentContacts] = useState<ChatUser[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentContacts') || '[]')
    } catch {
      return []
    }
  })

  const [messages, setMessages] = useState<Record<number, Message[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('chatMessages') || '{}')
    } catch {
      return {}
    }
  })

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>(
    () => {
      try {
        return JSON.parse(localStorage.getItem('unreadCounts') || '{}')
      } catch {
        return {}
      }
    }
  )

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem('recentContacts', JSON.stringify(recentContacts))
  }, [recentContacts])
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])
  useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts))
  }, [unreadCounts])

  // helpers
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

  const clearStore = () => {
    localStorage.removeItem('recentContacts')
    localStorage.removeItem('chatMessages')
    localStorage.removeItem('unreadCounts')
    setRecentContacts([])
    setMessages({})
    setUnreadCounts({})
    setSelectedUser(null)
    setOpen(false)
  }

  // clear on login/logout (token change)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authToken') clearStore()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ouvre automatiquement sur un message non-lu
  useEffect(() => {
    if (!open) {
      for (const [uidStr, cnt] of Object.entries(unreadCounts)) {
        const uid = Number(uidStr)
        if (cnt > 0) {
          const u = recentContacts.find(u => u.id === uid)
          if (u) {
            setSelectedUser(u)
            setOpen(true)
            resetUnread(uid)
          }
          break
        }
      }
    }
  }, [unreadCounts, open, recentContacts])

  // polling par contact
  const sinceRef = useRef<Record<number, number>>({})
  useEffect(() => {
    const timers: Record<number, number> = {}
    for (const u of recentContacts) {
      const uid = u.id
      sinceRef.current[uid] = sinceRef.current[uid] || 0

      timers[uid] = window.setInterval(async () => {
        try {
          const { messages: batch, lastId } = await getMessagesWith(
            uid,
            sinceRef.current[uid]
          )
          if (batch.length > 0) {
            setMessages(prev => ({
              ...prev,
              [uid]: [...(prev[uid] || []), ...batch],
            }))
            if (!(open && selectedUser?.id === uid)) {
              incrementUnread(uid)
            }
            sinceRef.current[uid] = lastId
          }
        } catch (err) {
          console.error('Polling error for', uid, err)
        }
      }, 10000)
    }
    return () => {
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
        clearStore,
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
