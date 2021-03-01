import { keys } from 'ts-transformer-keys'

import type { Block } from '@blockchain/block'

export type MineDigestPayload = MineRequestPartialDigestPayload | MineRequestFullDigestPayload | MineTransmitDigestPayload

export interface MineRequestPartialDigestPayload {
  type: 'request',
  subtype: 'partial',
  query: BlockNumberQuery
}

export type BlockNumberQuery = Exact | Explicit | Range

export interface Exact {
  exact: number
}

export interface Explicit {
  explicit: Array<number>
}

export interface Range {
  from: number,
  to: number
}

export interface MineRequestFullDigestPayload {
  type: 'request',
  subtype: 'full'
}

export interface MineTransmitDigestPayload {
  type: 'transmit',
  blocks: Array<Block>
}

export function factoryTransmitDigestMessage(pattern: Partial<MineTransmitDigestPayload> = {}): MineTransmitDigestPayload {
  const properties = keys<MineTransmitDigestPayload>()
  Object.keys(pattern).forEach(key => {
    if (!properties.includes(key as any)) {
      delete (pattern as any)[key]
    }
  })

  pattern.type = 'transmit'
  if (!pattern.blocks) {
    pattern.blocks = []
  }
  return pattern as MineTransmitDigestPayload
}