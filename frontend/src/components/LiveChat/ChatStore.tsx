// src/components/LiveChat/ChatStore.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import type { ChatUser } from '../../types'
import {
  getRecentContactIds,
  getUsersByIds,
  getUnreadCounts,
} from './api'

interface ChatStore {
  open: boolean
  setOpen: (b: boolean) => void

  selectedUserId: number | null
  setSelectedUserId: (id: number | null) => void

  // on stocke juste les IDs ici
  recentContactIds: number[]
  addRecentContactId: (id: number) => void

  // cache ID → ChatUser (pour affichage)
  contactsById: Record<number, ChatUser>

  unreadCounts: Record<number, number>
  resetUnread: (userId: number) => void

  addContact: (user: ChatUser) => void

  clearStore: () => void
}

const ChatStore = createContext<ChatStore | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const [recentContactIds, setRecentContactIds] = useState<number[]>([])
  const [contactsById, setContactsById] = useState<Record<number, ChatUser>>({})

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})

  // — 1) Polling IDs + counts toutes les secondes
  useEffect(() => {
    let mounted = true

    async function loadAll() {
      try {
        const [ids, counts] = await Promise.all([
          getRecentContactIds(),
          getUnreadCounts(),
        ])
        if (!mounted) return

        setRecentContactIds(ids)
        setUnreadCounts(counts)

        // récupérer tous les ChatUser manquants dans le cache
        const missing = ids.filter(id => !(id in contactsById))
        if (missing.length > 0) {
          const newUsers = await getUsersByIds(missing)
          setContactsById(prev => {
            const copy = { ...prev }
            for (const u of newUsers) copy[u.id] = u
            return copy
          })
        }
      } catch (err) {
        console.error('Erreur ChatStore polling:', err)
      }
    }

    loadAll()
    const timer = window.setInterval(loadAll, 1_000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [contactsById])

  const addRecentContactId = (id: number) => {
    if (!recentContactIds.includes(id)) {
      setRecentContactIds(prev => [...prev, id])
    }
  }

  const resetUnread = (userId: number) => {
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }))
  }

  const clearStore = () => {
    setOpen(false)
    setSelectedUserId(null)
    setRecentContactIds([])
    setContactsById({})
    setUnreadCounts({})
  }

  const addContact = (user: ChatUser) => {
    setContactsById(prev => ({ ...prev, [user.id]: user }))
  }

  return (
    <ChatStore.Provider
      value={{
        open,
        setOpen,
        selectedUserId,
        setSelectedUserId,
        recentContactIds,
        addRecentContactId,
        contactsById,
        addContact,
        unreadCounts,
        resetUnread,
        clearStore,
      }}
    >
      {children}
    </ChatStore.Provider>
  )
}

export function useChatStore(): ChatStore {
  const ctx = useContext(ChatStore)
  if (!ctx) throw new Error('useChatStore must be inside ChatProvider')
  return ctx
}
