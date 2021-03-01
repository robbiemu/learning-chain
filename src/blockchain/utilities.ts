import os from 'os'
import path from 'path'
import type { Worker } from 'worker_threads'
import TSWorker from 'ts-worker'
import { v4 as uuidV4 } from 'uuid'
import { Observable, Subject } from 'rxjs'

import { Hash } from './hash';
import { Block } from './block';

export function getTrailingSequence(blocks: Array<Block>): Array<Block> {
  const lastIndex = blocks.length - 1
  let prev: number = NaN
  for (let i = lastIndex; i >= 0; i--) {
    const number = blocks[i]?.number
    if (number === undefined || (isFinite(prev) && number + 1 !== prev)) {
      break
    }

    prev = number
  }

  if (!isFinite(prev)) {
    return blocks[lastIndex] ? [blocks[lastIndex]!] : []
  } else {
    const offset = blocks[lastIndex]!.number - prev
    return blocks.concat().splice(lastIndex - offset)
  }
}

export interface WorkOrder {
  left: Array<Block>,
  right: Array<Block>
}

export function demonstratesMostWork(work: WorkOrder): 'left' | 'right' | 'both' | undefined {
  const left = countWork(work.left)
  const right = countWork(work.right)
  if (left === undefined && right === undefined) {
    return
  }
  if (left! - right! > 0) {
    return 'left'
  } else if (left! - right! < 0) {
    return 'right'
  } else {
    return 'both'
  }
}

export function countWork(blocks: Array<Block>) {
  if (!blocks || !blocks.length) {
    return
  }
  return blocks.reduce((p, c) => p + difficulty(Hash.encode(c.toString())), 0)
}

export function difficulty(hash: string) {
  let i, b
  for (i = 0, b = hash.length; i < b; i++) {
    if (hash[i] !== '0') {
      break;
    }
  }
  return i
}

export function detect(hash: string, difficulty: number) {
  let i, b
  for (i = 0, b = hash.length; i < b; i++) {
    if (hash[i] !== '0') {
      break;
    }
  }
  return i === difficulty;
}

export function getBlockAtDifficulty(block: Partial<Block>, difficulty: number, index = 0, step = 1) {
  let result: Block
  let nonce = index
  do {
    result = new Block({ ...block, nonce: String(nonce) })
    nonce += step
  } while (!detect(Hash.encode(String(result)), difficulty))
  return result
}

export interface MultiServiceThreadpoolResolution { [threadpool: string]: any }

export class MultiService {
  private static resolver = new Subject<MultiServiceThreadpoolResolution>()
  static resolver$: Observable<MultiServiceThreadpoolResolution>
  static initialize() {
    MultiService.resolver$ = MultiService.resolver.asObservable()
  }
  static resolve(pr: Promise<any>, threadpool: string) {
    pr
      .then(v => MultiService.resolver.next({ [threadpool]: v }))
      .catch(e => console.error(e))
  }
}
MultiService.initialize()

import { default as tsconfig } from '../../tsconfig.json'
(tsconfig as any).files = true
delete (tsconfig as any).rootDir
tsconfig.compilerOptions.paths = Object.entries(tsconfig.compilerOptions.paths).reduce((p, c) => {
  let key = c[0]
  let value = c[1] as Array<string>
  p[key] = path.join(__dirname, '..', value[0]! as string)
  return p
}, {} as any)

/**
 * spawns threads to resolve hash at difficulty, publishing result in 
 * MultiService
 * @param block Block to resolve hash of
 * @param difficulty Difficulty of hash to resolve
 * @returns uuid of multiservice to subscribe to
 * usage:
 * const multiService = new MultiService()
 * const task = getBlockAtDifficultyMultiThreaded(myBlock, someDifficulty)
 * multiService.resolve$
 *   .pipe(first(resolution => resolution.hasOwnProperty(task)))
 *   .subscribe(resolution => onSuccess(resolution[task]))
 */
export function getBlockAtDifficultyMultiThreaded(block: Partial<Block>, difficulty: number): UUID {
  const uuid = uuidV4() // our task identifier
  const workers: Array<Worker> = []
  const threads = os.cpus()
  threads.forEach((_, i) => {
    const args = { block, difficulty, i, threads }
    const worker: Worker = TSWorker(path.join(__dirname, 'get-block-at-difficulty.worker.ts'), {
      workerData: {
        args,
        registerOptions: tsconfig
      }
    })

    workers.push(worker)
    worker.on('message', (result: Block) => {
      MultiService.resolve(new Promise(res => res(result)), uuid)
      workers.forEach(w => w.terminate())
    })
  })
  return uuid
}
