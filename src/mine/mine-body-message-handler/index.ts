import { Mixin } from '@lib/mixin.decorator';
import { assert } from '@lib/assert'
import { DifficultyMessageHandler } from '../mixins/difficulty-message-hander';
import { DigestMessageHandler } from '../mixins/digest-message-handler';
import { LassMessageHandler } from '../mixins/last-message.handler';
import { SubmitMessageHandler } from '../mixins/submit-message.handler';
import type {
  MineDigestPayload, MineBody, MineDifficultyPayload, MineLastPayload, MineSubmitPayload
} from '../interfaces';
import { MinePayloadTypes } from '../constants';

export interface MineBodyMessageHandler extends DifficultyMessageHandler, DigestMessageHandler, LassMessageHandler, SubmitMessageHandler { }
@Mixin(DifficultyMessageHandler, DigestMessageHandler, LassMessageHandler, SubmitMessageHandler)
export abstract class MineBodyMessageHandler {
  onMessage(this: any, body: MineBody) {
    assert(body.topic === this.ledger.topic)

    switch (body.type) {
      case MinePayloadTypes.Difficulty:
        this.onDifficultyMessage(body.data as MineDifficultyPayload)
      case MinePayloadTypes.Digest:
        this.onDigestMessage(body.data as MineDigestPayload)
      case MinePayloadTypes.Last:
        this.onLastMessage(body.data as MineLastPayload)
      case MinePayloadTypes.Submit:
        this.onSubmitMessage(body.data as MineSubmitPayload)
      case MinePayloadTypes.None:
        console.info(`[${this.constructor.name}::onMessage] body is type None`, body)
      default:
        console.warn(`[${this.constructor.name}::onMessage] unknown body type`, body.type)
    }
  }
}