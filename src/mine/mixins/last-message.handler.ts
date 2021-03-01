import type { Block } from '@blockchain/block'
import { MinePayloadTypes } from '../constants';
import { AbstractMine } from '../abstract-mine';
import { factoryAssertDifficultyMessage, factoryMineBody, factoryTransmitDigestMessage, MineLastPayload, MineTransmitLastPayload } from '../interfaces'

export abstract class LassMessageHandler extends AbstractMine {
  onLastMessage(payload: MineLastPayload) {
    switch (payload.type) {
      case 'request':
        this.onRequestLastMessage()
      case 'transmit':
        this.onTransmitLastMessage(payload as MineTransmitLastPayload)
      default:
        console.warn(`[${this.constructor.name}::onLastMessage] unknown last message type`, payload.type)
    }
  }

  onTransmitLastMessage(payload: MineTransmitLastPayload) {
    this.onAssertDifficulty(payload.difficulty)
    this.processBlocks([payload.submit!])
  }

  onRequestLastMessage() {
    if (isFinite(this.difficulty)) {
      const data = factoryAssertDifficultyMessage({ difficulty: this.difficulty, since: this.since })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Difficulty, data }))
    }
    this.resolveBlocks([-1]).then((blocks: Array<Block>) => {
      const data = factoryTransmitDigestMessage({ blocks })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Digest, data }))
    })
  }
}
