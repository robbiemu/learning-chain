import { AbstractMine } from '../abstract-mine';
import type { MineSubmitPayload } from '../interfaces'

export abstract class SubmitMessageHandler extends AbstractMine {
  onSubmitMessage(payload: MineSubmitPayload) {
    switch (payload.type) {
      case 'submit':
        this.onTransmitSubmitMessage(payload)
      default:
        console.warn(`[${this.constructor.name}::onSubmitMessage] unknown submit message type`, payload.type)
    }
  }

  onTransmitSubmitMessage(payload: MineSubmitPayload) {
    this.processBlocks([payload.block])
  }
}
