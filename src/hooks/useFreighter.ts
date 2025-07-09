import { useState, useEffect, useCallback } from 'react'
import { requestAccess, getAddress, isConnected } from '@stellar/freighter-api'

export function useFreighter() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState<boolean>(false)

  // Controllo robusto: provo a chiamare isConnected per capire se Freighter è disponibile
  useEffect(() => {
    (async () => {
      try {
        await isConnected();
        setAvailable(true);
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  const connectWallet = useCallback(async () => {
    if (!available) {
      setError('Freighter not detected')
      return
    }
    try {
      setLoading(true)
      const response = await requestAccess() // prompts the user
      if (response && response.address) {
        setPublicKey(response.address)
        setError(null)
      } else {
        setError('No address returned')
      }
    } catch (e: any) {
      setError(e.message || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }, [available])

  useEffect(() => {
    if (available) {
      isConnected()
        .then((conn) => {
          if (conn) {
            getAddress().then((res) => {
              if (res && res.address) setPublicKey(res.address)
            })
          }
        })
        .catch(() => {})
    }
  }, [available])

  return { publicKey, connectWallet, loading, error, available }
}