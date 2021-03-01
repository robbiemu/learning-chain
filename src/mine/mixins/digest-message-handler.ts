import type { Block } from '@blockchain/block'
import {
  MineDigestPayload, MineRequestPartialDigestPayload,
  MineRequestFullDigestPayload, MineTransmitDigestPayload, Exact,
  Explicit, Range, factoryTransmitDigestMessage,
  factoryMineBody
} from '../interfaces';
import { AbstractMine } from '../abstract-mine'
import { MinePayloadTypes } from '../constants';

export abstract class DigestMessageHandler extends AbstractMine {
  protected onDigestMessage(payload: MineDigestPayload) {
    switch (payload.type) {
      case 'request':
        this.onRequestDigestMessage(payload as MineRequestFullDigestPayload | MineRequestPartialDigestPayload)
      case 'transmit':
        this.onTransmitDigestMessage(payload as MineTransmitDigestPayload)
      default:
        console.warn(`[${this.constructor.name}::onDigestMessage] unknown digest message type`, payload.type)
    }
  }

  protected onTransmitDigestMessage(payload: MineTransmitDigestPayload) {
    this.processBlocks(payload.blocks)
  }

  protected onRequestDigestMessage(payload: MineRequestPartialDigestPayload | MineRequestFullDigestPayload) {
    switch (payload.subtype) {
      case 'partial':
        this.onRequestPartialDigestMessage(payload as MineRequestPartialDigestPayload)
      case 'full':
        this.onRequestFullDigestMessage()
      default:
        console.warn(`[${this.constructor.name}::onDigestMessage] unknown digest message subtype`, payload.subtype)
    }
  }

  protected onRequestPartialDigestMessage(payload: MineRequestPartialDigestPayload) {
    if (payload.query.hasOwnProperty('exact')) {
      this.resolveAndTransmitExactBlock(payload.query as Exact)
    } else if (payload.query.hasOwnProperty('explicit')) {
      this.resolveAndTransmitBlocks((payload.query as Explicit).explicit)
    } else if (payload.query.hasOwnProperty('from') && payload.query.hasOwnProperty('to')) {
      this.resolveAndTransmitDoubleBoundedRangeOfBlocks(payload.query as Range)
    } else if (!payload.query.hasOwnProperty('from') && payload.query.hasOwnProperty('to')) {
      this.resolveAndTransmitRangeToOfBlocks(payload.query as Range)
    } else if (payload.query.hasOwnProperty('from') && !payload.query.hasOwnProperty('to')) {
      this.resolveAndTransmitRangeFromOfBlocks(payload.query as Range)
    } else {
      console.warn(`[${this.constructor.name}::onRequestPartialDigestMessage] unknown digest message query`, payload.query)
    }
  }

  protected resolveAndTransmitExactBlock(query: Exact) {
    this.resolveBlocks([query.exact]).then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }

  resolveAndTransmitBlocks(blocks: Array<number>) {
    this.resolveBlocks(blocks).then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }

  resolveAndTransmitDoubleBoundedRangeOfBlocks(query: Range) {
    const explicit = Array.from({ length: query.to - query.from }, (_, i) => i + query.from)
    this.resolveBlocks(explicit).then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }

  resolveAndTransmitRangeToOfBlocks(query: Range) {
    const explicit = Array.from({ length: query.to }, (_, i) => i)
    this.resolveBlocks(explicit).then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }

  resolveAndTransmitRangeFromOfBlocks(query: Range) {
    const to = this.lastBlock?.number
    if (!to) {
      return
    }
    if (to > query.from) {
      const explicit = Array.from({ length: to - query.from }, (_, i) => i + query.from)
      this.resolveBlocks(explicit).then((blocks: Array<Block>) => {
        const data = factoryTransmitDigestMessage({ blocks })
        this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
      })
    }
  }

  onRequestFullDigestMessage() {
    this.resolveBlocks().then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }
}
