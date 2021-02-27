import type { Transaction } from '../transaction'

export type Records = Array<Record>

export type Record = Transaction | string;
