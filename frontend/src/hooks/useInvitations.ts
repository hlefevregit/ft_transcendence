// src/hooks/useInvitations.ts
import { useState, useEffect } from 'react'
import axios from 'axios'

export interface Invite {
  inviterId: number
  roomId:    string
}

export function useInvitations(pollInterval = 1000) {
  const [invites, setInvites] = useState<Invite[]>([])

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('authToken')

    async function fetchInvites() {
      if (!token) {
        return
      }
      try {
        const res = await axios.get<Invite[]>('/api/invitations', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (mounted) {
          setInvites(res.data)
        }
      } catch (err: any) {
        // console.error('[Invitations] erreur fetchInvites:', err.response?.status, err.message)
        if (err.response?.status === 401) {
          mounted = false
        }
      }
    }

    // premier appel
    fetchInvites()
    const timer = window.setInterval(fetchInvites, pollInterval)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [pollInterval])

  return invites
}
