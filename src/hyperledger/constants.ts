export enum Topics {
  Wallet = 'learning-chain--wallet-0.0.1',
  Mine = 'learning-chain--mine-0.0.1'
}

export const defaultJoinOptions = {
  lookup: true, // find & connect to peers
  announce: true // optional- announce self as a connection target
}

export const defaultConnectOptions = {} // or from import DefaultConnectOptions