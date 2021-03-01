import { isFuture } from 'date-fns'
import { keys } from 'ts-transformer-keys'

import { assert } from '@lib/assert'
import { isValidRecord, Records } from '@blockchain/record'
import { Hash } from '@blockchain/hash'

/** the Genesis Block must have a number of 0.
 * it may contain a data payload. Records are a part of the blockchain whose
 * schema may mutate by consensus over time.
 * its timestamp must be in the past
 */
export interface IGenesisBlock {
  number: 0
  timestamp: number
  data?: Records
}

/** all subsequent blocks must contain the hash of their predecessor.
 * a nonce may be used to produce the hash with desired characteristics.
 * data is a record of transactions in the block.
 * the number must follow sequentially
 */
export interface IBlock {
  number: number
  timestamp: number
  nonce?: string
  data?: Records
  lastHash: Hash
}

export type IValidBlock = IBlock | IGenesisBlock

/**
 * the block class facilitates generating blocks (both genesis blocks and
 * sequential blocks) from a partial pattern. It is not aware of the chain it
 * is destined to be attached to (helper methods are available to ensure
 * block-to-block relationships relative to the chain).
 */
export class Block {
  number: number = NaN
  timestamp: number = NaN
  nonce?: string
  data?: Records
  lastHash?: Hash

  constructor(pattern: Partial<Block> = {}) {
    assert(isValidPartialBlock(pattern))
    Object.entries(pattern).forEach(
      ([key, value]) => ((this as any)[key] = value)
    )
    assert(isFinite(this.number))
    assert(isFinite(this.timestamp))
  }

  /**
   * generate a genesis block to specification
   * @param pattern partial genesis block properties
   */
  static factoryGenesisBlock(pattern: Partial<IGenesisBlock> = {}) {
    assert(isValidPartialBlock(pattern))
    pattern.number = 0
    if (!pattern.timestamp) {
      pattern.timestamp = Date.now()
    } else {
      assert(isValidTimestamp(pattern.timestamp))
    }
    return new Block(pattern)
  }

  /**
   * validate block is self-consistent
   */
  get isInternallyConsistent(): boolean {
    return (
      isFinite(this.number) &&
      isFinite(this.timestamp) &&
      !!(this.number === 0 || this.lastHash)
    )
  }

  /**
   * produce a string representation of a block, based on the proeprties of one
   */
  toString(): string {
    const properties = keys<IBlock>()
    const reflection = properties.reduce((p, c) => {
      ; (p as any)[c] = (this as any)[c]
      return p
    }, <IBlock>{})
    return JSON.stringify(reflection)
  }
}

/**
 * validates a block's timestamp
 * -- namely, that the time is in the past
 * @param stamp timestamp
 */
export function isValidTimestamp(stamp: number) {
  return !isFuture(new Date(stamp))
}

/**
 * given a partial representation of a block, generate the block
 * @param block pattern to generate a block against
 */
export function isValidPartialBlock(block: Partial<IValidBlock>) {
  const properties = keys<IBlock>()
  return Object.keys(block).every(key => properties.includes(key as any))
}

/**
 * validate all blocks from this most recent to the given index
 * @param index chain index
 * @param chain blockchain
 * this is a naive validator, as it does not know the difficulty required on
 * the blockchain.
 */
export function isValidToBlock(index: number, chain: Array<Block>) {
  if (index === 0) {
    return isValidGenesisBlock(chain[index]!)
  } else {
    for (let i = index; i >= 1; i--) {
      const prev = chain[i - 1]
      const curr = chain[i]
      assert(curr && prev)

      if (!isValidBlock(curr, prev)) {
        return false
      }
    }
    return true
  }
}

/**
 * validate a block as a genesis block
 * @param block genesis block
 */
export function isValidGenesisBlock(block?: Block) {
  if (!block) {
    return false
  }

  return !!(
    block.isInternallyConsistent &&
    block.number === 0 &&
    isValidTimestamp(block.timestamp!) &&
    (block.data ?? []).every(isValidRecord)
  )
}

/**
 * validate a block relative to its antecessor in the chain
 * @param curr block to validate
 * @param prev previous in chain
 */
export function isValidBlock(curr?: Block, prev?: Block) {
  if (
    !curr ||
    !prev ||
    !curr.isInternallyConsistent ||
    !prev.isInternallyConsistent
  ) {
    return false
  }
  if (!isValidTimestamp(curr.timestamp!)) {
    console.info('[isValidBlock] invalid timestamp', curr)
    return false
  }
  if (curr.data && !curr.data?.every(isValidRecord)) {
    console.info('[isValidBlock] invalid data', curr)
    return false
  }
  if (
    !isFinite(curr.number) ||
    !isFinite(prev.number) ||
    prev.number + 1 !== curr.number
  ) {
    console.info('[isValidBlock] invalid number', curr.number, prev.number)
    return false
  }
  if (!curr?.lastHash || curr?.lastHash.hash !== Hash.encode(prev.toString())) {
    console.info('[isValidBlock] invalid lastHash', curr)
    return false
  }

  return true
}

/**
 * generates (in a default fashion) a next block in a chain, from a pattern
 * @param pattern partial block to use as template in generating current block
 * @param chain the chain that this block will go against
 * this method is not the method a miner will use, as this method is scoped
 * only to the requirements of a block, not the chain (so it does not take into
 * account difficulty)
 */
export function factoryNextBlock(pattern: Partial<IBlock>, chain: Array<Block>) {
  if (chain.length === 0) {
    return Block.factoryGenesisBlock()
  }
  let curr
  if (chain.length === 1) {
    curr = chain[0]
    assert(isValidGenesisBlock(curr))
  } else {
    const prev = chain[chain.length - 2]
    curr = chain[chain.length - 1]
    assert(isValidBlock(curr, prev))
  }

  const number = curr?.number! + 1
  const lastHash = new Hash()
  lastHash.hash = Hash.encode(curr!.toString())
  const timestamp = new Date().getTime()

  return new Block({ number, lastHash, timestamp, ...pattern })
}
