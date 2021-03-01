export const CONFIGURATION_FILE = './mine.json'
export const DEFAULT_LEDGER_FILE = './ledger.json'
export const DEFAULT_BAN_FILE = './mine.blacklist.json'

export enum MinePayloadTypes {
  None,
  Last = 'last', // get/transmit most recent Submit and difficulty
  Difficulty = 'difficulty', // difficulty consensus message
  Submit = 'sumbit', // new block to add to chain
  Digest = 'digest', // get/transmit (partial/full) digest
}