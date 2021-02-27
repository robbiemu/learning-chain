import type { AccountChange } from '../entity'

export interface Transaction {
  from: AccountChange
  to: Array<AccountChange>
}
