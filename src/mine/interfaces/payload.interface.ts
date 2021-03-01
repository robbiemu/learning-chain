import type { MineDifficultyPayload } from './difficulty-payload.interface';
import type { MineDigestPayload } from './digest-payload.interface';
import type { MineLastPayload } from './last-payload.interface';
import type { MineSubmitPayload } from './submit-payload.interface';

export type MinePayload = MineDifficultyPayload | MineDigestPayload | MineLastPayload | MineSubmitPayload
