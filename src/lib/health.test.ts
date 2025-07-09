// lib/health.test.ts
import { calculateHealthFactor, getHealthStatus, HEALTH_STATUS } from './health';

describe('Health library', () => {
  it('calculateHealthFactor returns correct % or Infinity', () => {
    expect(calculateHealthFactor(200n, 100n)).toBeCloseTo(200);
    expect(calculateHealthFactor(0n, 1n)).toBeCloseTo(0);
    expect(calculateHealthFactor(100n, 0n)).toBe(Infinity);
  });

  it('getHealthStatus categorizes correctly', () => {
    expect(getHealthStatus(200)).toBe(HEALTH_STATUS.HEALTHY);
    expect(getHealthStatus(140)).toBe(HEALTH_STATUS.WARNING);
    expect(getHealthStatus(100)).toBe(HEALTH_STATUS.CRITICAL);
  });
});
