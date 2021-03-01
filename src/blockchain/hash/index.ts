import crypto from 'crypto'

import type { FixedSizeArray } from '@lib/fixed-size-array';
import { assert } from '@lib/assert';
import { InterruptingBefore } from '@lib/aop/interrupting-before.decorator';
import { interuptingBeforeMessage } from './utils';

export class Hash {
  private raw?: FixedSizeArray<64, string>;

  set hash(hash: string | undefined) {
    this.setHash(hash)
  }
  get hash() {
    return this.raw?.join('')
  }

  private _message?: string
  set message(message: string | undefined) {
    this.setMessage(message)
  }
  get message(): string | undefined {
    return this._message
  }

  /**
   * Blockchains, use collision-resistant hashing algorithms, such as SHA-256, 
   * which takes a string of any length and produces a hash value of 256 bits.
   */
  static encode(message: string): string {
    return crypto.createHash('sha256')
      .update(message, 'utf8')
      .digest('hex')
      .toString()
  }

  static uuid(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  @InterruptingBefore(interuptingBeforeMessage)
  setHash(hash: string | undefined) {
    assert(hash)
    assert(hash.length === 64)

    this.raw = hash.split('') as unknown as FixedSizeArray<64, string>
  }

  @InterruptingBefore(interuptingBeforeMessage)
  setMessage(message: string | undefined) {
    assert(message)

    const hash = Hash.encode(message)
    this.raw = hash.split('') as unknown as FixedSizeArray<64, string>
    this._message = message
  }

  toString() {
    return this._message
  }
}
