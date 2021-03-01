import jsonfile from 'jsonfile'

import type { Account, AccountChange } from '@blockchain/entity';
import { Topics } from '@hyperledger/constants';
import { HyperLedger } from '@hyperledger/index';
import { CONFIGURATION_FILE, WalletConfiguration } from './constants';

export class Wallet {
  ledger = new HyperLedger();

  constructor() {
    this.ledger.onConnect = this.onConnect.bind(this)
    this.ledger.onDisconnect = this.onDisconnect.bind(this)
    this.ledger.onUpdated = this.onUpdate.bind(this)

    this.begin()
  }

  private begin() {
    jsonfile.readFile(CONFIGURATION_FILE)
      .then(obj => this.onReadConfiguration(obj))
      .catch(error => this.onReadConfiguration(error))
  }

  private onReadConfiguration(obj: any) {
    if (obj instanceof Error) {
      console.debug('[Wallet] error on reading configuration file', CONFIGURATION_FILE, obj)
      this.ledger.topic = Topics.Wallet
    } else {
      this.parseConfiguration(obj)
    }
    this.onReady()
  }

  private parseConfiguration(json: WalletConfiguration) {
    if (json.topic) {
      this.ledger.topic = json.topic
    }
    if (json.ConnectOptions) {
      this.ledger.swarmOptions = json.ConnectOptions
    }
    if (json.JoinOptions) {
      this.ledger.joinOptions = json.JoinOptions
    }
  }

  onReady() {
    this.ledger.connect()
  }

  onConnect() { }
  onDisconnect() { }
  onUpdate() { }

  query(entity: Account) { }
  isLiquid(accountChange: AccountChange) { }
  send(accountchange: AccountChange) { }
}