import { keys } from 'ts-transformer-keys';

import { Topics } from '@hyperledger/constants'
import { MinePayloadTypes } from '../constants';
import type { MinePayload } from './payload.interface';
import { SemVer } from 'semver';

export interface MineBody {
  transactionId: UUID,
  topic: Topics.Mine,
  version: SemVer,
  type: MinePayloadTypes,
  data: MinePayload
}

export function factoryMineBody(pattern: Partial<MineBody>) {
  const properties = keys<MineBody>()
  Object.keys(pattern).forEach(key => {
    if (!properties.includes(key as any)) {
      delete (pattern as any)[key]
    }
  })

  pattern.topic = Topics.Mine
  pattern.version = new SemVer('0.1.0')
  pattern.type = pattern.type ?? MinePayloadTypes.None

  return pattern as MineBody
}