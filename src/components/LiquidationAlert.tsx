"use client"

import type React from "react"
import { HiExclamationTriangle } from "react-icons/hi2"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateHealthFactor } from "../lib/health"

interface LiquidationAlertProps {
  positions: {
    collateral: Record<string, bigint>
    debt: Record<string, bigint>
  } | null
}

const LiquidationAlert: React.FC<LiquidationAlertProps> = ({ positions }) => {
  if (!positions) return null

  const NEAR_LIQ_THRESHOLD = 110
  const criticalPositions = Object.entries(positions.collateral).filter(([asset, collateral]) => {
    const debt = positions.debt[asset] || 0n
    const hf = calculateHealthFactor(collateral, debt)
    return hf <= NEAR_LIQ_THRESHOLD && hf !== Number.POSITIVE_INFINITY
  })

  if (criticalPositions.length === 0) return null

  return (
    <Alert className="mb-6 bg-red-500/10 border-red-500/30 backdrop-blur-sm animate-pulse">
      <HiExclamationTriangle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-300">
        <div className="flex items-center justify-between">
          <div>
            <strong>Liquidation Risk Alert!</strong>
            <p className="mt-1">
              {criticalPositions.length} position{criticalPositions.length > 1 ? "s are" : " is"} at high risk of
              liquidation. Consider adding more collateral or reducing debt.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default LiquidationAlert
