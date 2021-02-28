import { isValidRecord } from '@blockchain/record'
import { factoryRandomTransaction } from '@blockchain/transaction/transaction.mocks'

describe('record', () => {
  it('should validate string records', () => {
    let record = 'not dummy-data'
    expect(isValidRecord(record)).toBeTruthy()

    record = 'dummy-data'
    expect(isValidRecord(record)).toBeFalsy()
  })

  it('should validate Transaction records', () => {
    let record = factoryRandomTransaction()
    expect(isValidRecord(record)).toBeTruthy()
  })
})