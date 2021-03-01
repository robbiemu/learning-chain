declare module 'hyperswarm' {
  import h from 'hyperswarm'
  type FactorySwarm = (options: Partial<ConnectOptions>) => EventEmitter;
  export const hyperswarm: FactorySwarm = h
  export interface Swarm extends EventEmmiter {
    join: Function,
    on: Function
  }

  export interface ConnectOptions {
    // Optionally overwrite the default set of bootstrap servers
    bootstrap: Array<Address>,
    // Set to false if this is a long running instance on a server
    // When running in ephemeral mode you don't join the DHT but just 
    // query it instead. If unset, or set to a non-boolean (default undefined)
    // then the node will start in short-lived (ephemeral) mode and switch 
    // to long-lived (non-ephemeral) mode after a certain period of uptime
    ephemeral?: boolean,
    // total amount of peers that this peer will connect to
    maxPeers: number,
    // set to a number to restrict the amount of server socket
    // based peer connections, unrestricted by default.
    // setting to 0 is the same as Infinity, to disallowe server
    // connections set to -1
    maxServerSockets: number,
    // set to a number to restrict the amount of client sockets
    // based peer connections, unrestricted by default.
    maxClientSockets: number,
    // apply a filter before connecting to the peer
    validatePeer: (peer) => boolean,
    // configure peer management behaviour
    queue: {
      // an array of backoff times, in millieconds
      // every time a failing peer connection is retried
      // it will wait for specified milliseconds based on the
      // retry count, until it reaches the end of the requeue
      // array at which time the peer is considered unresponsive
      // and retry attempts cease
      requeue: Array<Milliseconds>,
      // configure when to forget certain peer characteristics
      // and treat them as fresh peer connections again
      forget: {
        // how long to wait before forgetting that a peer
        // has become unresponsive
        unresponsive: Milliseconds,
        // how long to wait before fogetting that a peer
        // has been banned
        banned: Milliseconds
      },
      // attempt to reuse existing connections between peers across multiple topics
      multiplex: boolean
    }
  }

  export const DefaultConnectOptions = {
    maxPeers = 24,
    maxServerSockets = Infinity,
    maxClientSockets: number = Infinity,
    validatePeer = (peer) => true,
    queue = {
      requeue =[1000, 5000, 15000],
      forget = {
        unresponsive: Infinity,
        banned: Infinity
      },
      multiplex = false
    }
  }

  export type Milliseconds = number

  export interface JoinOptions {
    lookup: boolean // find & connect to peers
    announce?: boolean // optional- announce self as a connection target
  }
  export type Socket = Duplex;

  export interface ConnectionInfo {
    type: string //Should be either 'tcp' or 'utp'.
    client: boolean //If true, the connection was initiated by this node.
    topics: Array<Buffer>//Array.The list of topics associated with this connection(when multiplex: true)
    peer: ConnectionPeer
  }

  export interface Host {
    port: number
    host: string //The IP address of the referrer.
  }

  export interface Referrer extends Host {
    id: Buffer
    topic: Buffer //The identifier which this peer was discovered under.
  }

  // Object describing the peer.Will be null if client === false
  export interface ConnectionPeer {
    port: number
    host: string //The IP address of the peer.
    local: boolean //Is the peer on the LAN ?
    referrer: Referrer // Object.The address of the node that informed us of the peer.
  }

  export interface Peer {
    port: number
    host: string //The IP address of the peer.
    local: boolean //Is the peer on the LAN ?
    referrer: Referrer //The address of the node that informed us of the peer.
  }

  export type Topic = string;
  export type Buffer = string;

  export interface TopicDigest {
    key: Topic
  }
}
