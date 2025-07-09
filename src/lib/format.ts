// src/utils/format.ts
export function formatTokenAmount(
    amount: bigint | string | number,
    decimals: number,
    locale = 'it-IT',
    minFrac = 2,
    maxFrac = 2
  ): string {
    const raw = typeof amount === 'bigint' ? amount : BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const num = Number(raw) / Number(divisor);
    return num.toLocaleString(locale, {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    });
  }
  
  // wrapper per XLM (7 decimali)
  export const formatXLM = (amount: bigint | string | number) =>
    formatTokenAmount(amount, 7);
  