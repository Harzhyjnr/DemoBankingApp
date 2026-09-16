import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api/client'
import type { CryptoHolding, MarketPrice, PortfolioSummary } from '@/lib/api/types'

interface PortfolioResponse {
  summary: PortfolioSummary
  holdings: CryptoHolding[]
}

interface MarketResponse {
  prices: MarketPrice[]
}

function fetchPortfolio(): Promise<PortfolioResponse> {
  return apiClient<PortfolioResponse>('/portfolio')
}

function fetchMarket(): Promise<MarketResponse> {
  return apiClient<MarketResponse>('/market')
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  })
}

export function useMarket() {
  return useQuery({
    queryKey: ['market'],
    queryFn: fetchMarket,
  })
}
