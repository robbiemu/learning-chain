import { isValidTransaction, Transaction } from '@blockchain/transaction'

/* records are meant to be principally transactions, but what goes into the record and when we consider it valid is only encoded in consensus behavior */

export type Records = Array<Record>
export interface BaseRecord {
  recordType: string
}

export type Record = Transaction | string

/**
 * validate different record types
 * @param record record to validate
 */
export function isValidRecord(record: Record) {
  if (typeof record === 'string') {
    return isValidRecordString(record)
  }
  switch (record.recordType) {
    case 'Transaction':
      return isValidTransaction(record)
    default:
      console.error('[isValidRecord] unknown recordType', record)
  }
}

export function isValidRecordString(record: string) {
  return record !== 'dummy-data' // allows for testing
}
