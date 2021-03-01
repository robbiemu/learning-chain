import type { ConnectOptions, JoinOptions } from 'hyperswarm';
import type { SemVer } from "semver"

import type { Topics } from '@hyperledger/constants';

export interface MineConfiguration {
  version: SemVer
  ledgerFile: FilePath
  banFile: FilePath
  topic: Topics
  ConnectOptions: ConnectOptions
  JoinOptions: JoinOptions
}
