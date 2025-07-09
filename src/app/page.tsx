"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import { PoolV2 } from "@blend-capital/blend-sdk"
import { useFreighter } from "../hooks/useFreighter"
import { calculateHealthFactor } from "../lib/health"
import Header from "../components/Header"
import { sendTelegramNotification } from "../lib/sendTgNotification"
import { formatXLM, formatTokenAmount } from '@/lib/format'

const rpcUrl = "https://soroban-testnet.stellar.org"
const passphrase = "Test SDF Network ; September 2015"
const POOL_ID = process.env.NEXT_PUBLIC_BLEND_POOL_ID || "CCLBPEYS3XFK65MYYXSBMOGKUI4ODN5S7SUZBGD7NALUQF64QILLX5B5"

interface Positions {
  collateral: Record<string, bigint>
  debt: Record<string, bigint>
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%)",
    color: "white",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(10px)",
    padding: "1rem 0",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  button: {
    padding: "0.5rem 1rem",
    background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    backdropFilter: "blur(10px)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    padding: "1.5rem",
    backdropFilter: "blur(10px)",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  statIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  positionCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  positionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  positionInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  assetIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  healthyBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  warningBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    color: "#eab308",
    border: "1px solid rgba(234, 179, 8, 0.3)",
  },
  criticalBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "rgba(148, 163, 184, 0.3)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
}

export default function Home() {
  const { publicKey, connectWallet, loading, error, available } = useFreighter()
  const [alerts, setAlerts] = useState<Record<string, boolean>>({})
  const [mockMode, setMockMode] = useState(false)
  const [mockCollateral, setMockCollateral] = useState<string>("200")
  const [mockDebt, setMockDebt] = useState<string>("150")

  

// fetchUser rimane così:
const fetchUser = async () => {
  if (!publicKey) return null
  const pool     = await PoolV2.load({ rpc: rpcUrl, passphrase }, POOL_ID)
  const poolUser = await pool.loadUser(publicKey)
  console.log("🔍 [fetchUser] raw poolUser.positions:", poolUser.positions)
  return poolUser.positions      // <-- Positions
}

  const { data: realPositions } = useSWR(
    publicKey && !mockMode ? ["positions", publicKey, POOL_ID] : null,
    fetchUser,
    { refreshInterval: 5_000 }
  )
  console.log("🔄 [useSWR] realPositions:", realPositions)

  const rawPositions = realPositions ?? { 
    collateral: new Map(), 
    liabilities: new Map() 
  }

  const positions: Positions = mockMode
    ? {
        collateral: { MOCK: BigInt(mockCollateral) },
        debt:       { MOCK: BigInt(mockDebt) },
      }
    : {
        collateral: Object.fromEntries(
          Array.from(rawPositions.collateral.entries()).map(
            ([assetId, amt]) => [assetId, BigInt(amt)]
          )
        ),
        debt: Object.fromEntries(
          Array.from(rawPositions.liabilities.entries()).map(
            ([assetId, amt]) => [assetId, BigInt(amt)]
          )
        ),
      }
      console.log("➡️ rawPositions.collateral:", Array.from(rawPositions.collateral.entries()))
console.log("➡️ rawPositions.liabilities:", Array.from(rawPositions.liabilities.entries()))


useEffect(() => {
  if (!positions.collateral || !positions.debt) return

  // formatter per numeri (it-IT, 2 decimali)
  const nf = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const LIQ_THRESHOLD = 100
  const NEAR_LIQ_THRESHOLD = 110

  Object.entries(positions.collateral).forEach(([asset, collateral]) => {
    const debt = positions.debt[asset] || 0n
    const hf = calculateHealthFactor(collateral, debt) // es. 118.4567

    // --- FORMATTAZIONE UMANO-LEGGIBILE ---
    // se XLM (7 decimali). Per altri token cambia 1e7 con 10**decimals
    const collateralHuman = nf.format(Number(collateral) / 1e7)
    const debtHuman       = nf.format(Number(debt)       / 1e7)
    const hfHuman         = nf.format(hf) // percentuale già in % (es. 118.45)

    if (hf <= LIQ_THRESHOLD && !alerts[asset]) {
      const msg = `collateralization ${hfHuman}% — liquidation risk!`
      toast.error(msg, { duration: 8000 })
      sendTelegramNotification(`⚠️ ${msg}`)
      setAlerts(prev => ({ ...prev, [asset]: true }))
    }
    else if (hf <= NEAR_LIQ_THRESHOLD && hf > LIQ_THRESHOLD && !alerts[`${asset}-near`]) {
      const msg = `collateralization ${hfHuman}% - next to liquidation`
      toast(msg, { icon: "⚠️", duration: 6000 })
      sendTelegramNotification(`⚠️ ${msg}`)
      setAlerts(prev => ({ ...prev, [`${asset}-near`]: true }))
    }
  })
}, [positions, alerts])


  

  const totalCollateral = Object.values(positions.collateral).reduce((sum, val) => sum + val, 0n)
  const totalDebt = Object.values(positions.debt).reduce((sum, val) => sum + val, 0n)

  const getHealthStatus = (hf: number) => {
    if (hf > 150) return { text: "Healthy", style: styles.healthyBadge }
    if (hf > 120) return { text: "Warning", style: styles.warningBadge }
    return { text: "Critical", style: styles.criticalBadge }
  }

  const getProgressColor = (hf: number) => {
    if (hf > 150) return "#22c55e"
    if (hf > 120) return "#eab308"
    return "#ef4444"
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <Header
          publicKey={publicKey}
          connectWallet={connectWallet}
          loading={loading}
          available={available}
        />

      {/* Main Content */}
      <main style={styles.main}>
        {/* Settings */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem", fontWeight: "600" }}>Development Settings</h3>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <input type="checkbox" checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} />
            <span>Enable Mock Mode (for testing)</span>
          </label>

          {mockMode && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  Mock Collateral
                </label>
                <input
                  type="number"
                  value={mockCollateral}
                  onChange={(e) => setMockCollateral(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: "6px",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Mock Debt</label>
                <input
                  type="number"
                  value={mockDebt}
                  onChange={(e) => setMockDebt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: "6px",
                    color: "white",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              ...styles.card,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {publicKey ? (
          <>
            {/* Stats Grid */}
            <div style={styles.grid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{ fontSize: "0.875rem", opacity: 0.8 }}>Total Collateral</span>
                  <div style={{ ...styles.statIcon, backgroundColor: "rgba(34, 197, 94, 0.2)" }}>
                    <span style={{ color: "#22c55e" }}>↗</span>
                  </div>
                </div>
                <div style={{ ...styles.statValue, color: "#22c55e" }}>{formatXLM(totalCollateral)}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{ fontSize: "0.875rem", opacity: 0.8 }}>Total Debt</span>
                  <div style={{ ...styles.statIcon, backgroundColor: "rgba(239, 68, 68, 0.2)" }}>
                    <span style={{ color: "#ef4444" }}>↘</span>
                  </div>
                </div>
                <div style={{ ...styles.statValue, color: "#ef4444" }}>{formatXLM(totalDebt)}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{ fontSize: "0.875rem", opacity: 0.8 }}>Healthy Positions</span>
                  <div style={{ ...styles.statIcon, backgroundColor: "rgba(59, 130, 246, 0.2)" }}>
                    <span style={{ color: "#3b82f6" }}>✓</span>
                  </div>
                </div>
                <div style={{ ...styles.statValue, color: "#3b82f6" }}>
                  {
                    Object.entries(positions.collateral).filter(([asset, collateral]) => {
                      const debt = positions.debt[asset] || 0n
                      const hf = calculateHealthFactor(collateral, debt)
                      return hf > 150
                    }).length
                  }
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={{ fontSize: "0.875rem", opacity: 0.8 }}>At Risk Positions</span>
                  <div style={{ ...styles.statIcon, backgroundColor: "rgba(234, 179, 8, 0.2)" }}>
                    <span style={{ color: "#eab308" }}>⚠</span>
                  </div>
                </div>
                <div style={{ ...styles.statValue, color: "#eab308" }}>
                  {
                    Object.entries(positions.collateral).filter(([asset, collateral]) => {
                      const debt = positions.debt[asset] || 0n
                      const hf = calculateHealthFactor(collateral, debt)
                      return hf <= 150
                    }).length
                  }
                </div>
              </div>
            </div>

            {/* Positions */}
            <div style={styles.card}>
              <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: "600" }}>Your Positions</h2>

              {Object.entries(positions.collateral).map(([asset, collateral]) => {
                const debt = positions.debt[asset] || 0n
                const hf = calculateHealthFactor(collateral, debt)
                const status = getHealthStatus(hf)

                return (
                  <div key={asset} style={styles.positionCard}>
                    <div style={styles.positionHeader}>
                      <div style={styles.positionInfo}>
                        <div style={styles.assetIcon}>{asset.slice(0, 2)}</div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>{asset}</h3>
                          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.7 }}>Asset Position</p>
                        </div>
                      </div>
                      <div style={{ ...styles.badge, ...status.style }}>{status.text}</div>
                    </div>

                    <div style={styles.metricsGrid}>
                      <div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.25rem" }}>Collateral</div>
                        <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#22c55e" }}>
                          {formatXLM(collateral)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.25rem" }}>Debt</div>
                        <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#ef4444" }}>
                          {formatXLM(debt)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.25rem" }}>Health Factor</div>
                        <div style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                          {hf === Number.POSITIVE_INFINITY ? "∞" : `${hf.toFixed(2)}%`}
                        </div>
                      </div>
                    </div>

                    {hf !== Number.POSITIVE_INFINITY && (
                      <div style={{ marginTop: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>Liquidation Risk</span>
                          <span>{hf.toFixed(1)}%</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${Math.min(hf, 200) / 2}%`,
                              backgroundColor: getProgressColor(hf),
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.75rem",
                            opacity: 0.6,
                            marginTop: "0.25rem",
                          }}
                        >
                          <span>Critical (100%)</span>
                          <span>Warning (120%)</span>
                          <span>Healthy (150%+)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={styles.card}>
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div
                style={{
                  ...styles.assetIcon,
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 1rem auto",
                  fontSize: "24px",
                }}
              >
                W
              </div>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: "bold" }}>Connect Your Wallet</h2>
              <p style={{ margin: "0 0 1.5rem 0", opacity: 0.8 }}>
                Connect your Freighter wallet to monitor your Stellar Blend positions and receive liquidation alerts.
              </p>
              {available ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    ...(loading ? styles.buttonDisabled : {}),
                  }}
                >
                  {loading ? "Connecting..." : "Connect Freighter Wallet"}
                </button>
              ) : (
                <div>
                  <p style={{ color: "#ef4444", marginBottom: "1rem" }}>Freighter wallet not detected</p>
                  <button
                    onClick={() => window.open("https://freighter.app/", "_blank")}
                    style={{
                      ...styles.button,
                      background: "transparent",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                    }}
                  >
                    Install Freighter Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
