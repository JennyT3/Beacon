"use client"

import type React from "react"
import { HiExclamationTriangle, HiCheckCircle, HiXCircle, HiArrowTrendingDown, HiArrowTrendingUp } from "react-icons/hi2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateHealthFactor, getHealthStatus, HEALTH_STATUS } from "../lib/health"

interface ModernPositionsTableProps {
  positions: {
    collateral: Record<string, bigint>
    debt: Record<string, bigint>
  } | null
}

const ModernPositionsTable: React.FC<ModernPositionsTableProps> = ({ positions }) => {
  if (!positions) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading positions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const positionEntries = Object.entries(positions.collateral).map(([asset, collateral]) => {
    const debt = positions.debt[asset] || 0n
    const hf = calculateHealthFactor(collateral, debt)
    const status = getHealthStatus(hf)

    return { asset, collateral, debt, hf, status }
  })

  const getStatusIcon = (status: HEALTH_STATUS) => {
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return <HiCheckCircle className="h-4 w-4 text-green-400" />
      case HEALTH_STATUS.WARNING:
        return <HiExclamationTriangle className="h-4 w-4 text-yellow-400" />
      case HEALTH_STATUS.CRITICAL:
        return <HiXCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusColor = (status: HEALTH_STATUS) => {
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case HEALTH_STATUS.WARNING:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case HEALTH_STATUS.CRITICAL:
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <HiArrowTrendingUp className="h-5 w-5 mr-2 text-blue-400" />
          Your Positions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positionEntries.map(({ asset, collateral, debt, hf, status }) => (
            <div
              key={asset}
              className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{asset.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{asset}</h3>
                    <p className="text-slate-400 text-sm">Asset Position</p>
                  </div>
                </div>
                <Badge className={getStatusColor(status)}>
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-400">
                    <HiArrowTrendingUp className="h-3 w-3 mr-1" />
                    Collateral
                  </div>
                  <div className="text-lg font-semibold text-green-400">{collateral.toString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-400">
                    <HiArrowTrendingDown className="h-3 w-3 mr-1" />
                    Debt
                  </div>
                  <div className="text-lg font-semibold text-red-400">{debt.toString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-400">Health Factor</div>
                  <div className="text-lg font-semibold text-white">
                    {hf === Number.POSITIVE_INFINITY ? "∞" : `${hf.toFixed(2)}%`}
                  </div>
                </div>
              </div>

              {hf !== Number.POSITIVE_INFINITY && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Liquidation Risk</span>
                    <span className="text-slate-300">{hf.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(hf, 200)} max={200} className="h-2 bg-slate-700" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Critical (100%)</span>
                    <span>Warning (120%)</span>
                    <span>Healthy (150%+)</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ModernPositionsTable
