import type { AccountChange } from '@blockchain/entity'
import type { Transaction } from '@blockchain/transaction'

export function factoryRandomTransaction(pattern: Partial<Transaction> = {}): Transaction {
  const from = factoryRandomAccountChange()
  from.quantity = Math.abs(from.quantity) * -1
  return {
    recordType: 'Transaction',
    from,
    to: [factoryRandomAccountChange({ quantity: from.quantity * -1 })],
    ...pattern
  }
}

export function factoryRandomAccountChange(pattern: Partial<AccountChange> = {}): AccountChange {
  return {
    transactionId: 0,
    entity: Math.random(),
    quantity: -1,
    signature: 'dummy-data',
    ...pattern
  }
}
