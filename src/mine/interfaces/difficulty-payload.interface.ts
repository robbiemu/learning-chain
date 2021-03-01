import { keys } from 'ts-transformer-keys'

export type MineDifficultyPayload = MineRequestDifficultyPayload | MineAssertDifficultyPayload

export interface MineRequestDifficultyPayload {
  type: 'request'
}

export interface MineAssertDifficultyPayload extends Difficulty {
  type: 'assert'
}

export interface Difficulty {
  difficulty: number,
  since: number
}

export function factoryAssertDifficultyMessage(pattern: Partial<MineAssertDifficultyPayload> = {}): MineAssertDifficultyPayload {
  const properties = keys<MineAssertDifficultyPayload>()
  Object.keys(pattern).forEach(key => {
    if (!properties.includes(key as any)) {
      delete (pattern as any)[key]
    }
  })

  pattern.type = 'assert'
  keys<Difficulty>().forEach(prop => {
    if (!pattern.hasOwnProperty(prop)) {
      pattern[prop] = NaN
    }
  })
  return pattern as MineAssertDifficultyPayload
}
