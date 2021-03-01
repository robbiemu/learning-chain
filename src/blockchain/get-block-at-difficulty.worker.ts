import { parentPort, workerData } from 'worker_threads'

import { getBlockAtDifficulty } from './utilities'

const { block, difficulty, index, step } = workerData

parentPort!.postMessage(getBlockAtDifficulty(block, difficulty, index, step))
