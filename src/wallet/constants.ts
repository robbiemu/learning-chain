import type { ConnectOptions, JoinOptions } from 'hyperswarm';
import type { SemVer } from 'semver';

import type { Topics } from '@hyperledger/constants';

export const CONFIGURATION_FILE = './wallet.json'

export interface WalletConfiguration {
  version: SemVer
  topic: Topics
  ConnectOptions: ConnectOptions
  JoinOptions: JoinOptions
}
