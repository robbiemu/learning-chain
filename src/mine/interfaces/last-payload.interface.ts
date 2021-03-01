import type { Block } from '@blockchain/block'
import type { Difficulty } from './difficulty-payload.interface'

export type MineLastPayload = MineRequestLastPayload | MineTransmitLastPayload

export interface MineRequestLastPayload {
  type: 'request'
}

export interface MineTransmitLastPayload {
  type: 'transmit'
  submit?: Block
  difficulty: Difficulty
}