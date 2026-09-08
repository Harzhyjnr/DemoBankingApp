import { faker } from '@faker-js/faker'

faker.seed(20260907)

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  currency: string
}

export const currentUser: User = {
  id: 'usr_demo',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: 'demo@bank.com',
  currency: 'USD',
}
