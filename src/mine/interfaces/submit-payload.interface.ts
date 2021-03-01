import type { Block } from '@blockchain/block'

export interface MineSubmitPayload {
  type: 'submit',
  block: Block
}