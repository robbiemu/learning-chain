import { addYears } from 'date-fns/fp'
import * as Faker from 'faker'

import {
  Block,
  factoryNextBlock,
  isValidGenesisBlock,
  isValidToBlock
} from './index'

describe('block', () => {
  it('should be', () => {
    const chain: Array<Block> = []
    expect(chain).toBeTruthy()
  })

  it('should generate a genesis block with number 0', () => {
    const block = Block.factoryGenesisBlock()
    expect(block).toBeTruthy()
    expect(block.isInternallyConsistent).toBeTruthy()
    expect(isValidGenesisBlock(block)).toBeTruthy()
  })

  it('should not generate a genesis block with invalid number', () => {
    const block = Block.factoryGenesisBlock({ number: 1 as 0 })
    expect(block).toBeTruthy()
    expect(block.isInternallyConsistent).toBeTruthy()
    expect(block.number).toEqual(0)
  })

  it('should not generate a genesis block with invalid timestamp', () => {
    const date = addYears(1)(new Date())

    const fn = () => Block.factoryGenesisBlock({ timestamp: date.getTime() })
    expect(fn).toThrow()
  })

  it('should reject invalid hashes in chains', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())

    chain.push(factoryNextBlock({}, chain))
    chain[1]!.lastHash!.hash = Faker.random.alphaNumeric(64)
    expect(isValidToBlock(1, chain)).toBeFalsy()

    chain.length = 1
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(0, chain)).toBeTruthy()
    chain[2]!.lastHash!.hash = Faker.random.alphaNumeric(64)
    expect(isValidToBlock(2, chain)).toBeFalsy()
  })

  it('should compose verifiable chains', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())

    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(1, chain)).toBeTruthy()

    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(2, chain)).toBeTruthy()
  })

  it('should reject invalid timestamps in chains', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())
    chain[0]!.timestamp = addYears(1)(new Date()).getTime()
    expect(isValidToBlock(0, chain)).toBeFalsy()

    chain.length = 0
    chain.push(Block.factoryGenesisBlock())
    expect(isValidToBlock(0, chain)).toBeTruthy()
    chain.push(factoryNextBlock({}, chain))
    chain[1]!.timestamp = addYears(1)(new Date()).getTime()
    expect(isValidToBlock(1, chain)).toBeFalsy()

    chain.length = 1
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(0, chain)).toBeTruthy()
    chain[2]!.timestamp = addYears(1)(new Date()).getTime()
    expect(isValidToBlock(2, chain)).toBeFalsy()
  })

  it('should reject non-sequential numbers in chains', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())

    chain.push(factoryNextBlock({}, chain))
    chain[1]!.number = 0
    expect(isValidToBlock(1, chain)).toBeFalsy()

    chain.length = 1
    chain.push(factoryNextBlock({}, chain))
    chain[1]!.number = 2
    expect(isValidToBlock(1, chain)).toBeFalsy()

    chain.length = 1
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(0, chain)).toBeTruthy()
    chain[2]!.number = 3
    chain[3]!.number = 4
    expect(isValidToBlock(2, chain)).toBeFalsy()
  })

  it('should reject invalid data in chains', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())
    chain[0]!.data = ['dummy-data']
    expect(isValidToBlock(0, chain)).toBeFalsy()

    chain[0]!.data = undefined
    chain.push(factoryNextBlock({}, chain))
    chain[1]!.data = ['dummy-data']
    expect(isValidToBlock(1, chain)).toBeFalsy()

    chain.length = 1
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    expect(isValidToBlock(0, chain)).toBeTruthy()
    chain[2]!.data = ['dummy-data']
    expect(isValidToBlock(2, chain)).toBeFalsy()
  })
})
