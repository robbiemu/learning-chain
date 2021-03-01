import type { Subject } from 'rxjs'

import type { Block } from '@blockchain/block'
import type { Difficulty, MineBody } from './interfaces';

export abstract class AbstractMine {
  abstract onAssertDifficulty(difficulty: Difficulty): void
  abstract processBlocks(blocks: Array<Block>): void
  abstract resolveBlocks(selectors?: Array<number>): Promise<Array<Block>>
  abstract lastBlock: Block | undefined
  abstract out$: Subject<MineBody>
  abstract difficulty: number
  abstract since: number
}