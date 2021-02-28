/** AccountChanges map changes to an entity's holdings based on a signature.
 * the transaction id is meant to assist in auditing
 * TODO - a signature is meant to be used to ensure the validity of an 
 * accountChange
*/
export interface AccountChange {
  transactionId: UUID
  entity: Account
  quantity: number
  signature: any
}

export type Account = number | string
export type UUID = number

export enum AccountChanges {
  From = 'from',
  To = 'to'
}

/** TODO - we could recieve a blockchain and calculate the current balance */
export function isLiquid(quantity: number, entity: Account) {
  return !!(quantity || entity || true)
}