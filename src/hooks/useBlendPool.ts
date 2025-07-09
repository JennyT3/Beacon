import { useState, useEffect } from 'react'
import { Server } from '@stellar/stellar-sdk'
import { Pool } from '@blend-capital/blend-sdk'
import { fromRaw, formatAmount } from '@/utils/positions'

export function useBlendPool(poolId: string) {
  const [positions, setPositions] = useState<PositionHuman[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      setLoading(true)
      const rpcUrl       = process.env.NEXT_PUBLIC_RPC_URL!
      const passphrase   = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE!
      const server       = new Server(rpcUrl, { allowHttp: true })
      const pool         = await Pool.load({ rpcUrl, passphrase }, poolId)
      const assetIds     = pool.metadata.reserveList
      // 1) metadata token
      const metas = await Promise.all(assetIds.map(id =>
        server.tokens.token(id).then(tc => ({ 
          id, 
          symbol: tc.symbol(), 
          decimals: tc.decimals() 
        }))
      ))
      // 2) tassi di exchange bToken→underlying
      const rates = assetIds.map(id => {
        const info = pool.assets.get(id)!
        return Number(info.exchangeRate) / 1e7
      })
      // 3) posizioni raw
      const user = await pool.loadUser(/* publicKey */)
      const raws = metas.map((m, i) => ({
        ...m,
        rawCollateral: user.positions.collateral.get(m.id)!,
        rawDebt:       user.positions.debt.get(m.id)!,
        rate:          rates[i],
      }))
      // 4) converti → umano
      const humans = raws.map(r => ({
        symbol: r.symbol,
        collateral: formatAmount(r.rawCollateral, r.decimals, r.rate),
        debt:       formatAmount(r.rawDebt,       r.decimals, r.rate),
      }))
      if (!cancel) setPositions(humans)
      setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [poolId])

  return { positions, loading }
}
