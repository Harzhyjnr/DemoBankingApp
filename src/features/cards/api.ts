import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api/client'
import type { Card, CardStatus } from '@/lib/api/types'

interface CardsResponse {
  cards: Card[]
}

interface CardResponse {
  card: Card
}

function fetchCards(): Promise<CardsResponse> {
  return apiClient<CardsResponse>('/cards')
}

type ToggleAction = 'freeze' | 'unfreeze'

function toggleCard(action: ToggleAction, cardId: string): Promise<CardResponse> {
  return apiClient<CardResponse>(`/cards/${cardId}/${action}`, { method: 'POST' })
}

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: fetchCards,
    select: (data) => data.cards,
  })
}

export interface ToggleCardInput {
  cardId: string
  status: Exclude<CardStatus, 'closed'>
}

export function useToggleCardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, status }: ToggleCardInput) =>
      toggleCard(status === 'frozen' ? 'freeze' : 'unfreeze', cardId),
    onMutate: async ({ cardId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['cards'] })
      const previous = queryClient.getQueryData<CardsResponse>(['cards'])
      queryClient.setQueryData<CardsResponse>(['cards'], (data) =>
        data?.cards
          ? { cards: data.cards.map((card) => (card.id === cardId ? { ...card, status } : card)) }
          : data,
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<CardsResponse>(['cards'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
