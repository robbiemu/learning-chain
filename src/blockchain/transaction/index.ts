import { AccountChange, AccountChanges, isLiquid } from '@blockchain/entity'
import type { BaseRecord } from '@blockchain/record'

export interface Transaction extends BaseRecord {
  recordType: 'Transaction'
  from: AccountChange
  to: Array<AccountChange>
}

/**
 * a transaction is valid when the from clause and the two clause are 
 * considered valid
 * @param tx Transaction 
 */
export function isValidTransaction(tx: Transaction) {
  return (
    isValidAccountChangeByType(AccountChanges.From, tx) &&
    isValidAccountChangeByType(AccountChanges.To, tx)
  )
}

/**
 * validate one side of a transaction
 * @param accountChangeType 
 * @param transaction 
 * the from clause must have a negative quantity, who's absolute value is equal
 * to the sum of the to clause. its magnitude should also be less than the
 * account,
 * the to clause must be a list of positive quantities, who's sum is equal to
 * the absolute value of the from clause and who's members are all positive 
 * values. the resulting account balances should positive and valid for an 
 * account
 */
export function isValidAccountChangeByType(
  accountChangeType: AccountChanges,
  transaction: Transaction
) {
  switch (accountChangeType) {
    case AccountChanges.From:
      return (
        isFinite(transaction.from.quantity) && transaction.from.quantity < 0 &&
        isLiquid(transaction.from.quantity, transaction.from.entity)
      )
    case AccountChanges.To:
      let sum = 0
      for (const accountChange of transaction.to) {
        if (!isFinite(accountChange.quantity) || accountChange.quantity < 0 || !isLiquid(accountChange.quantity, accountChange.entity)) {
          return false
        }
        sum += accountChange.quantity
      }
      return -1 * sum === transaction.from.quantity
    default:
      throw new Error(
        '[isValidAccountChangeByType] unknown accountChange type ' +
        accountChangeType
      )
  }
}
