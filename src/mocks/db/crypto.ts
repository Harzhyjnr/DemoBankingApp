import type {
  AssetSymbol,
  CryptoHolding,
  Currency,
  MarketPrice,
  PortfolioSummary,
} from '@/lib/api/types'

const ASSET_META: Record<AssetSymbol, { name: string; price: number; change24h: number }> = {
  BTC: { name: 'Bitcoin', price: 15_200_000_000, change24h: 2.14 },
  ETH: { name: 'Ethereum', price: 562_000_000, change24h: -1.48 },
  USDT: { name: 'Tether', price: 1_640_00, change24h: 0.03 },
}

const HOLDING_BALANCES: Record<AssetSymbol, number> = {
  BTC: 0.0328,
  ETH: 1.24,
  USDT: 24000,
}

// Deterministic sparkline generator (24 points, stable per symbol).
function sparkline(symbol: AssetSymbol): number[] {
  const base = ASSET_META[symbol].price
  const swing = symbol === 'BTC' ? 0.04 : symbol === 'ETH' ? 0.05 : 0.004
  const points: number[] = []
  let seed = symbol === 'BTC' ? 42 : symbol === 'ETH' ? 87 : 13
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return (seed / 2147483648) * 2 - 1
  }
  let drift = 0.5 + next() * 0.5
  for (let i = 0; i < 24; i++) {
    drift += next() * swing
    drift = Math.max(0.2, Math.min(1.4, drift))
    points.push(Math.round(base * drift))
  }
  // End on the current price.
  points[points.length - 1] = base
  return points
}

let priceCache: MarketPrice[] | null = null

function prices(): MarketPrice[] {
  if (priceCache) return priceCache
  priceCache = (Object.keys(ASSET_META) as AssetSymbol[]).map((symbol) => ({
    symbol,
    name: ASSET_META[symbol].name,
    price: ASSET_META[symbol].price,
    change24h: ASSET_META[symbol].change24h,
    sparkline: sparkline(symbol),
  }))
  return priceCache
}

function holdingPrice(symbol: AssetSymbol): number {
  return prices().find((entry) => entry.symbol === symbol)?.price ?? 0
}

export const market = {
  getPrices(): MarketPrice[] {
    return prices()
  },

  getHoldings(): CryptoHolding[] {
    return (Object.keys(HOLDING_BALANCES) as AssetSymbol[]).map((symbol) => {
      const balance = HOLDING_BALANCES[symbol]
      return {
        symbol,
        balance,
        value: Math.round(balance * holdingPrice(symbol)),
      }
    })
  },

  portfolioSummary(cashMinor: number, currency: Currency): PortfolioSummary {
    const holdings = this.getHoldings()
    const cryptoValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

    // Weighted 24h change across crypto (USDT ~flat pulls it to a mild positive).
    const totalValue = cashMinor + cryptoValue
    const weighted =
      holdings.reduce(
        (sum, holding) =>
          sum + holding.value * (prices().find((p) => p.symbol === holding.symbol)?.change24h ?? 0),
        0,
      ) / Math.max(cryptoValue, 1)

    return {
      totalValue,
      cashValue: cashMinor,
      cryptoValue,
      change24h: Number(weighted.toFixed(2)),
      currency,
    }
  },
}
