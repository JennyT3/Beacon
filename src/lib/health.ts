// lib/health.ts
export enum HEALTH_STATUS {
    HEALTHY = "healthy",
    WARNING = "warning",
    CRITICAL = "critical",
  }
  
  export function calculateHealthFactor(collateral: bigint, debt: bigint): number {
    if (debt === 0n) return Infinity;
    return Number((collateral * 100n) / debt);
  }
  
  export function getHealthStatus(hf: number): HEALTH_STATUS {
    if (hf > 150) return HEALTH_STATUS.HEALTHY;
    if (hf > 120) return HEALTH_STATUS.WARNING;
    return HEALTH_STATUS.CRITICAL;
  }
  