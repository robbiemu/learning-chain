import { AbstractMine } from '../abstract-mine'
import { factoryAssertDifficultyMessage, factoryMineBody, MineAssertDifficultyPayload, MineDifficultyPayload } from '../interfaces'
import { MinePayloadTypes } from '../constants';

export abstract class DifficultyMessageHandler extends AbstractMine {
  protected onDifficultyMessage(payload: MineDifficultyPayload) {
    switch (payload.type) {
      case 'assert':
        this.onAssertDifficultyMessage(payload)
      case 'request':
        this.onRequestDifficultyMessage()
      default:
        console.warn(`[${this.constructor.name}::onDifficultyMessage] unknown difficulty message type`, payload.type)
    }
  }

  protected onAssertDifficultyMessage(payload: MineAssertDifficultyPayload) {
    this.onAssertDifficulty(payload)
  }

  protected onRequestDifficultyMessage() {
    if (isFinite(this.difficulty)) {
      const data = factoryAssertDifficultyMessage({ difficulty: this.difficulty, since: this.since })
      this.out$.next(factoryMineBody({ type: MinePayloadTypes.Difficulty, data }))
    }
  }
}
