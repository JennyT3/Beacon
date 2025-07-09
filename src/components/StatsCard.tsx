"use client"

import type React from "react"
import { HiShieldCheck, HiExclamationTriangle, HiArrowTrendingDown, HiArrowTrendingUp } from "react-icons/hi2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateHealthFactor, getHealthStatus, HEALTH_STATUS } from "../lib/health"

interface StatsCardsProps {
  positions: {
    collateral: Record<string, bigint>
    debt: Record<string, bigint>
  } | null
}

const StatsCards: React.FC<StatsCardsProps> = ({ positions }) => {
  if (!positions) return null

  const totalCollateral = Object.values(positions.collateral).reduce((sum, val) => sum + val, 0n)
  const totalDebt = Object.values(positions.debt).reduce((sum, val) => sum + val, 0n)

  const positionsCount = Object.keys(positions.collateral).length
  const healthyPositions = Object.entries(positions.collateral).filter(([asset, collateral]) => {
    const debt = positions.debt[asset] || 0n
    const hf = calculateHealthFactor(collateral, debt)
    return getHealthStatus(hf) === HEALTH_STATUS.HEALTHY
  }).length

  const warningPositions = positionsCount - healthyPositions

  const stats = [
    {
      title: "Total Collateral",
      value: totalCollateral.toString(),
      icon: HiArrowTrendingDown,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Total Debt",
      value: totalDebt.toString(),
      icon: HiArrowTrendingUp,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Healthy Positions",
      value: healthyPositions.toString(),
      icon: HiShieldCheck,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "At Risk Positions",
      value: warningPositions.toString(),
      icon: HiExclamationTriangle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`bg-slate-800/50 border ${stat.borderColor} backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsCards
