import { authHandlers } from '@/mocks/handlers/auth'
import { accountHandlers } from '@/mocks/handlers/accounts'
import { transactionHandlers } from '@/mocks/handlers/transactions'
import { transferHandlers } from '@/mocks/handlers/transfers'
import { cardHandlers } from '@/mocks/handlers/cards'
import { insightHandlers } from '@/mocks/handlers/insights'
import { settingHandlers } from '@/mocks/handlers/settings'

export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...transactionHandlers,
  ...transferHandlers,
  ...cardHandlers,
  ...insightHandlers,
  ...settingHandlers,
]
