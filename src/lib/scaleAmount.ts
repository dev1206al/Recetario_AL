export function scaleAmount(amount: string, factor: number): string {
  if (!amount || factor === 1) return amount

  const trimmed = amount.trim()

  // Try plain number
  const plain = parseFloat(trimmed)
  if (!isNaN(plain) && String(plain) === trimmed) {
    return formatNum(plain * factor)
  }

  // Try fraction like "1/2" or "3/4"
  const fractionMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (fractionMatch) {
    const val = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
    return formatNum(val * factor)
  }

  // Try mixed number like "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixedMatch) {
    const val = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3])
    return formatNum(val * factor)
  }

  // Not numeric — return as-is (e.g. "al gusto", "pizca")
  return trimmed
}

function formatNum(n: number): string {
  // Up to 2 decimals, strip trailing zeros
  const rounded = Math.round(n * 100) / 100
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '')
}
