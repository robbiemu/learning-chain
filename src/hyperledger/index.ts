import { hyperswarm, Swarm, ConnectionInfo, ConnectOptions, JoinOptions, Peer, Socket, TopicDigest } from 'hyperswarm'

import { assert } from '@lib/assert';
import { defaultConnectOptions, defaultJoinOptions, Topics } from './constants'

export class HyperLedger {
  topic?: Topics
  swarm?: Swarm
  swarmOptions: Partial<ConnectOptions> = defaultConnectOptions
  joinOptions: Partial<JoinOptions> = defaultJoinOptions

  /**
   * Emitted once a discovery cycle for a particular topic has completed. The 
   * topic can be identified by the key property of the emitted object. After 
   * this event the peer will wait for period of between 5 and 10 minutes 
   * before looking for new peers on that topic again.
   */
  private _onUpdated?: Function
  get onUpdated() {
    return this._onUpdated || this.defaultOnUpdate
  }
  set onUpdated(fn: Function) {
    this._onUpdated = fn
  }

  /**
   * A new connection has been created. You should handle this event by using 
   * the socket.
   */
  private _onConnect?: Function
  get onConnect() {
    return this._onConnect || this.defaultOnConnect
  }
  set onConnect(fn: Function) {
    this._onConnect = fn
  }

  /** A connection has been dropped. */
  private _onDisconnect?: Function
  get onDisconnect() {
    return this._onDisconnect || this.defaultOnDisconnect
  }
  set onDisconnect(fn: Function) {
    this._onDisconnect = fn
  }

  /**
   * A new peer has been discovered on the network and has been queued for 
   * connection.
   */
  private _onPeer?: Function
  get onPeer() {
    return this._onPeer || this.defaultOnPeer
  }
  set onPeer(fn: Function) {
    this._onPeer = fn
  }

  /**
   * A peer has been rejected as a connection candidate.
   */
  private _onPeerRejected?: Function
  get onPeerRejected() {
    return this._onPeerRejected || this.defaultOnPeerRejected
  }
  set onPeerRejected(fn: Function) {
    this._onPeerRejected = fn
  }

  connect() {
    assert(this.topic)
    this.swarm = hyperswarm(this.swarmOptions)
    this.swarm?.join(this.topic, this.joinOptions)

    this.swarm?.on('connection', this.onConnect.bind(this))
    this.swarm?.on('disconnection', this.onConnect.bind(this))
    this.swarm?.on('peer', this.onConnect.bind(this))
    this.swarm?.on('peer-rejected', this.onConnect.bind(this))
    this.swarm?.on('updated', this.onConnect.bind(this))
  }

  private defaultOnUpdate(payload: TopicDigest) {
    console.info('[HyperLedger::onConnect] update', payload)
  }

  private defaultOnConnect(socket: Socket, info: ConnectionInfo) {
    console.info('[HyperLedger::onConnect] new connection', info)
  }

  private defaultOnDisconnect(socket: Socket, info: ConnectionInfo) {
    console.info('[HyperLedger::onConnect] connection ended', info)
  }

  private defaultOnPeer(peer: Peer) {
    console.info('[HyperLedger::onConnect] new peer!', peer.host)
  }

  private defaultOnPeerRejected(peer: Peer) {
    console.info('[HyperLedger::onConnect] peer rejected!', peer.host)
  }
}
