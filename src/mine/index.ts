import type { ConnectionInfo, Socket, Topic, Peer } from 'hyperswarm'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { rxToStream, Streamable } from 'rxjs-stream'
import jsonfile from 'jsonfile'

import { assert } from '@lib/assert';
import { Topics } from '@hyperledger/constants'
import { HyperLedger } from '@hyperledger/index'
import { Block, isValidToBlock } from '@blockchain/block'
import type { MineBody, MineConfiguration, Difficulty } from './interfaces'
import { CONFIGURATION_FILE, DEFAULT_LEDGER_FILE, DEFAULT_BAN_FILE } from './constants'
import { MineBodyMessageHandler } from './mine-body-message-handler'
import { demonstratesMostWork, getTrailingSequence } from '@blockchain/utilities'

export class Mine extends MineBodyMessageHandler {
  private _blockchain: Array<Block> = []
  private _blacklist: Set<Peer> = new Set()
  private ledger = new HyperLedger();

  get lastBlock(): Block | undefined {
    return this._blockchain[this._blockchain.length]
  }
  difficulty: number = NaN
  since: number = NaN

  in$ = new Subject<MineBody>()
  out$ = new Subject<MineBody>();
  in: any
  out: any

  ledgerFile: FilePath
  banFile: FilePath

  constructor() {
    super()

    this.ledgerFile = DEFAULT_LEDGER_FILE
    this.banFile = DEFAULT_BAN_FILE

    this.in = rxToStream(this.in$.pipe(map<MineBody, Streamable>((value: MineBody) => JSON.stringify(value))))
    this.in$.subscribe(this.onMessage)
    this.out = rxToStream(this.out$.pipe(map<MineBody, Streamable>((value: MineBody) => JSON.stringify(value))), { objectMode: true })

    this.connectLedgerCallbacks()

    this.begin()
  }

  private connectLedgerCallbacks() {
    this.ledger.onConnect = this.onConnect.bind(this)
    this.ledger.onDisconnect = this.onDisconnect.bind(this)
    this.ledger.onUpdated = this.onUpdateComplete.bind(this)
    this.ledger.onPeer = this.onPeer.bind(this)
    this.ledger.onPeerRejected = this.onPeerRejected.bind(this)
  }

  private begin() {
    jsonfile.readFile(CONFIGURATION_FILE)
      .then(obj => this.onReadConfiguration(obj))
      .catch(error => this.onReadConfiguration(error))
  }

  private onReadConfiguration(obj: any) {
    if (obj instanceof Error) {
      console.debug('[Mine] error on reading configuration file', CONFIGURATION_FILE, obj)
      this.ledger.topic = Topics.Mine
    } else {
      this.parseConfiguration(obj)
    }

    jsonfile.readFile(this.banFile)
      .then(obj => this.onReadBlacklist(obj))
      .catch(error => this.onReadBlacklistError(error))

    jsonfile.readFile(this.ledgerFile)
      .then(obj => this.onReadLedger(obj))
      .catch(error => this.onReadLedgerError(error))
      .finally(() => this.onReady())
  }

  private parseConfiguration(json: MineConfiguration) {
    if (json.topic) {
      this.ledger.topic = json.topic
    }
    if (json.ledgerFile) {
      this.ledgerFile = json.ledgerFile
    }
    if (json.banFile) {
      this.banFile = json.banFile
    }
    if (json.ConnectOptions) {
      this.ledger.swarmOptions = json.ConnectOptions
    }
    if (json.JoinOptions) {
      this.ledger.joinOptions = json.JoinOptions
    }
  }

  private onReadLedger(json: Array<Block>) {
    this._blockchain = json
  }

  private onReadLedgerError(err: Error) {
    console.error('[Mine] error on reading ledger file', err)
  }

  private onReadBlacklist(json: Array<Peer>) {
    console.info('[Mine] loaded blacklisted peers from ban file')
    this._blacklist = new Set(json)
  }

  private onReadBlacklistError(err: Error) {
    console.debug('[Mine] error on reading ban file', err)
  }

  private onUpdatedBlacklist(peer: Peer) {
    console.info('[Mine] added peer to ban file', peer)
  }

  private onUpdateBlacklistError(err: Error) {
    console.debug('[Mine] error on writing to ban file', err)
  }

  blacklist(peer: Peer) {
    this._blacklist.add(peer)
    jsonfile.writeFile(this.banFile, JSON.stringify(Array.from(this._blacklist)))
      .then(() => this.onUpdatedBlacklist(peer))
      .catch(err => this.onUpdateBlacklistError(err))
  }

  private onReady() {
    this.ledger.connect()
  }

  private onConnect(socket: Socket, info: ConnectionInfo) {
    console.info(new Date(), '[Mine] connected to socket: ', socket, info.type, info.peer)
    console.info('topics at this connection to the sawrm', info.topics)

    this.in.pipe(socket).pipe(this.out)
  }

  private onDisconnect(socket: Socket, info: ConnectionInfo) {
    console.info(new Date(), '[Mine] disconnected from socket', socket, info.type)
  }

  private onUpdateComplete(payload: { key: Topic }) {
    console.info(new Date(), '[Mine] discovery cycle for a particular topic has completed', payload.key)
  }

  private onPeer(peer: Peer) {
    console.info(new Date(), '[Mine] A new peer has been discovered on the network and has been queued for connection.', peer)
  }

  private onPeerRejected(peer: Peer) {
    console.info(new Date(), '[Mine] A peer has been rejected as a connection candidate.', peer)
    this.blacklist(peer)
  }

  onAssertDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty.difficulty
    this.since = difficulty.since
  }

  processBlocks(blocks: Array<Block>) {
    const original = this._blockchain.concat()
    let curr = 0
    let next = 0
    for (const block of blocks.sort((a, b) => a.number - b.number)) {
      if (curr < next) { // skip through previous sequence considered
        curr += 1
        continue
      }

      const index = this._blockchain.findIndex(b => block.number === b.number)
      if (index === -1) { // makes a longer chain
        const sequence = blocks.slice(curr).filter((b, i) => b.number === i + block.number)

        if (isValidToBlock(block.number, [...getTrailingSequence(this._blockchain), ...sequence])) {
          this._blockchain.push(...sequence)
        } else {
          console.warn('[Mine::processBlocks] sequence not valid in blockchain', sequence)
          this._blockchain = original
          return
        }
        next = curr + sequence.length
      } else { // challenge chain
        let proposedBlockChain = [...this._blockchain]
        proposedBlockChain.length = index
        proposedBlockChain = getTrailingSequence(proposedBlockChain)

        const sequence = blocks.slice(curr).filter((b, i) => b.number === i + block.number)
        proposedBlockChain.push(...sequence)

        if (isValidToBlock(block.number, proposedBlockChain)) {
          const workOrder = {
            left: this._blockchain.slice(0, index),
            right: proposedBlockChain
          }
          if (demonstratesMostWork(workOrder) === 'right') {
            // now we must find where in the original blockchain this sequence is attaching to
            const i = this._blockchain.findIndex(b => b.number === proposedBlockChain[0]?.number)
            const lastIndex = proposedBlockChain.length - 1
            const j = this._blockchain.findIndex(b => b.number > (proposedBlockChain[lastIndex]?.number ?? Infinity))

            this._blockchain = [...this._blockchain.slice(0, i), ...proposedBlockChain, ...this._blockchain.slice(j)]

            next = curr + sequence.length
          } else {
            console.warn('[Mine::processBlocks] resulting sequence does not demonstarte most work', sequence)
            this._blockchain = original
            return
          }
        } else {
          console.warn('[Mine::processBlocks] sequence not valid in blockchain', sequence)
          this._blockchain = original
          return
        }
      }
      curr += 1
    }
  }

  resolveBlocks(selectors?: Array<number>): Promise<Array<Block>> {
    assert(this._blockchain.length)
    if (selectors) {
      const results = selectors?.reduce((p, c) => {
        p.add(this._blockchain[c === -1 ? this._blockchain.length - 1 : c]!)
        return p
      }, new Set<Block>())
      return new Promise<Array<Block>>(() => Array.from(results))
    } else {
      return new Promise<Array<Block>>(() => this._blockchain)
    }
  }
}
