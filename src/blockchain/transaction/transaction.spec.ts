import type { Account } from '@blockchain/entity'
import { isValidTransaction } from '@blockchain/transaction'
import { factoryRandomAccountChange, factoryRandomTransaction } from './transaction.mocks'

import * as entity from '@blockchain/entity'
  ;
(entity as any).isLiquid = jest.fn()

describe('transaction', () => {
  beforeEach(() => {
    (entity as any).isLiquid.mockReturnValue(true)
  })

  it('should be validated by isValidTransaction', () => {
    const tx = factoryRandomTransaction()
    expect(isValidTransaction(tx)).toBeTruthy()
  })

  it('should be REJECT transactions with positive values in from clause', () => {
    const tx = factoryRandomTransaction()
    tx.from.quantity = 1
    tx.to[0]!.quantity = 1
    expect(isValidTransaction(tx)).toBeFalsy()
  })

  it('should be REJECT transactions with negative values in to clause', () => {
    const tx = factoryRandomTransaction()
    tx.from.quantity = -1
    tx.to[0]!.quantity = -1
    expect(isValidTransaction(tx)).toBeFalsy()
  })

  it('should be REJECT transactions with unequal transactional values', () => {
    const tx = factoryRandomTransaction()
    tx.from.quantity = -1
    tx.to.push(factoryRandomAccountChange())
    tx.to[1]!.quantity = Math.random()
    expect(isValidTransaction(tx)).toBeFalsy()
  })

  it('should be REJECT transactions with infinite transactional values', () => {
    const tx = factoryRandomTransaction()
    tx.from.quantity = -Infinity
    expect(isValidTransaction(tx)).toBeFalsy()

    tx.from.quantity = -1
    tx.to[0]!.quantity = Infinity
    expect(isValidTransaction(tx)).toBeFalsy()
  })

  it('should be REJECT transactions with illiquid from values', () => {
    const maxValue = 1000
    const statement: { [key: string]: number } = {
      'dummy-data': 0, // cannot spend
      'not dummy-data': 1, // cannot overspend
    }
    const isSaneMaximum = (quantity: number) => quantity < maxValue
      ;
    (entity as any).isLiquid.mockImplementation((quantity: any, account: Account) => isSaneMaximum((statement[account] ?? 0) + quantity) && (statement[account] ?? 0) + quantity > 0)

    const tx = factoryRandomTransaction()
    tx.from.entity = 'dummy-data'
    tx.from.quantity = -1
    expect(isValidTransaction(tx)).toBeFalsy()
    tx.from.entity = 'not dummy-data'
    tx.to[0]!.quantity = maxValue
    tx.to[0]!.entity = 'not dummy-data'
    expect(isValidTransaction(tx)).toBeFalsy()

    tx.from.quantity = -0.5
    tx.to[0]!.quantity = 0.5
    expect(isValidTransaction(tx)).toBeTruthy()
  })
})