"use client"

import type React from "react"
import { HiWallet, HiChartBar, HiShieldCheck } from "react-icons/hi2"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  publicKey: string | null
  connectWallet: () => void
  loading: boolean
  available: boolean
}

const Header: React.FC<HeaderProps> = ({ publicKey, connectWallet, loading, available }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <HiChartBar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Stellar Blend Monitor</h1>
              <p className="text-sm text-slate-400">Track your positions & avoid liquidation</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!available && (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                <HiShieldCheck className="h-3 w-3 mr-1" />
                Freighter Not Detected
              </Badge>
            )}

            {available && !publicKey && (
              <Button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <HiWallet className="h-4 w-4 mr-2" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {publicKey && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Connected
                </Badge>
                <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-sm text-slate-300 font-mono">{formatAddress(publicKey)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
