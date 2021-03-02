import {
  countWork, difficulty, getBlockAtDifficulty,
  getTrailingSequence, demonstratesMostWork, getBlockAtDifficultyMultiThreaded, MultiService
} from './utilities'
import { Hash } from './hash'
import { Block, factoryNextBlock } from './block'
import { first } from 'rxjs/operators'

describe('getTrailingSequence', () => {
  it('should return the longest trailing sequential series of blocks', () => {
    const chain: Array<Block> = []
    chain.push(Block.factoryGenesisBlock())
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))
    chain.push(factoryNextBlock({}, chain))

    chain[4]!.number = 6
    chain[3]!.number = 5

    expect(getTrailingSequence(chain)).toHaveLength(2)

    chain[2]!.number = 4

    expect(getTrailingSequence(chain)).toHaveLength(3)

    chain.length = 0

    expect(getTrailingSequence(chain)).toHaveLength(0)
  })
})

describe('detect', () => {
  it('should find the nonce to produce a hash at a given difficulty', () => {

    const chain: Array<Block> = []
    const data = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']

    chain.push(Block.factoryGenesisBlock())
    chain.push(getBlockAtDifficulty(factoryNextBlock({ data }, chain), 4))

    expect(Hash.encode(String(chain[1])).slice(0, 4)).toEqual('0000')
  })
})

describe('difficulty', () => {
  it('should count leading zeros in hash of object', () => {
    const chain: Array<Block> = []
    const data = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']

    chain.push(Block.factoryGenesisBlock())
    chain.push(getBlockAtDifficulty(factoryNextBlock({ data }, chain), 4))

    console.log(Hash.encode(String(chain[1])))

    expect(difficulty(Hash.encode(String(chain[1])))).toEqual(4)
  })
})

describe('getBlockAtDifficultyMultithreaded', () => {
  it('should produce a hash multithreaded', done => {
    const chain: Array<Block> = []
    const data = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']

    chain.push(Block.factoryGenesisBlock())

    jest.setTimeout(240000);

    const task = getBlockAtDifficultyMultiThreaded(factoryNextBlock({ data }, chain), 6)
    MultiService.resolver$.pipe(first(resolution => resolution.hasOwnProperty(task))).subscribe(resolution => {
      chain.push(resolution[task])

      console.log(chain[1], Hash.encode(String(chain[1])))

      expect(difficulty(Hash.encode(String(chain[1])))).toEqual(6)
      done()
    })
  })
})

describe('countWork', () => {
  it('should report the difficulty to produce the chain', () => {
    const chain: Array<Block> = []
    const data = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']

    chain.push(Block.factoryGenesisBlock())
    chain.push(getBlockAtDifficulty(factoryNextBlock({ data }, chain), 4))
    chain.push(getBlockAtDifficulty(factoryNextBlock({ data: ['dummy-data'] }, chain), 4))

    const base = difficulty(Hash.encode(String(chain[0])))

    expect(countWork(chain)).toEqual(base + 8)
  })
})

describe('demonstratesMostWork', () => {
  it('should identify the chain with the most work', () => {
    const less: Array<Block> = []
    const more: Array<Block> = []
    const alt: Array<Block> = []
    const data = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']

    less.push(Block.factoryGenesisBlock())
    less.push(getBlockAtDifficulty(factoryNextBlock({ data }, less), 3))
    less.push(getBlockAtDifficulty(factoryNextBlock({ data: ['dummy-data'] }, less), 3))

    more.push(Block.factoryGenesisBlock())
    more.push(getBlockAtDifficulty(factoryNextBlock({ data }, more), 4))
    more.push(getBlockAtDifficulty(factoryNextBlock({ data: ['dummy-data'] }, more), 4))

    alt.push(Block.factoryGenesisBlock())
    alt.push(getBlockAtDifficulty(factoryNextBlock({ data }, alt), 4))
    alt.push(getBlockAtDifficulty(factoryNextBlock({ data: ['dummy-data'] }, alt), 4))

    console.log(...[less, more, alt].map(x => Hash.encode(String(x))))

    expect(demonstratesMostWork({ left: less, right: more })).toEqual('right')
    expect(demonstratesMostWork({ left: more, right: less })).toEqual('left')
    expect(demonstratesMostWork({ left: alt, right: more })).toEqual('both')
    expect(demonstratesMostWork({ left: [], right: [] })).toEqual(undefined)
  })
})