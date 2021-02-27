import type { Records } from '@blockchain/record';
import type { Hash } from '@blockchain/hash'

export interface Block {
  timestamp: number;
  nonce: number;
  data: Records;
  lastHash: Hash;
}
