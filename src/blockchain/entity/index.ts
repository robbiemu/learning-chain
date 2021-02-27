export interface AccountChange {
  transactionId: UUID;
  entity: Account;
  quantity: number;
}

export type Account = number;
export type UUID = number;
