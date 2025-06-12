// src/chat/hooks/usePolling.ts
import { useState, useEffect, useRef } from 'react'

export function usePolling<T>(
  fetchFn: (since: number) => Promise<T[]>,
  intervalMs: number
): T[] {
  const [data, setData] = useState<T[]>([])        // accumulateur des éléments reçus
  const sinceRef = useRef<number>(Date.now())      // timestamp du dernier fetch

  useEffect(() => {
    let active = true                              // empêche la mise à jour après démontage

    async function tick() {
      const items = await fetchFn(sinceRef.current) // récupère tout ce qui est nouveau
      if (!active || items.length === 0) return     // stop si plus rien à faire
      setData(prev => [...prev, ...items])         // ajoute les nouveaux éléments
      sinceRef.current = Date.now()                // met à jour le timestamp
    }

    tick()                                          // appel immédiat
    const id = setInterval(tick, intervalMs)        // rappels périodiques
    return () => { active = false; clearInterval(id) }
  }, [fetchFn, intervalMs])

  return data                                     // renvoie la liste cumulée
}
