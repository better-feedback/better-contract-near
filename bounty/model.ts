import {
  context,
  u128,
  PersistentUnorderedMap,
  ContractPromise,
} from 'near-sdk-as'

@nearBindgen
class Fund {
  amount: u128
  funder: string

  constructor(amount: u128) {
    this.amount = amount
    this.funder = context.sender
  }
}

@nearBindgen
class Log {
  timestamp: u64
  message: string
  status: string

  constructor(status: string, message: string) {
    this.status = status
    this.message = message
    this.timestamp = context.blockTimestamp
  }
}

const FACTORY_CONTRACT = 'chezhe.testnet'

enum STATUS {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in progress',
  DONE = 'done',
  CLOSED = 'closed',
}

@nearBindgen
export class BetterBounty {
  id: number
  title: string
  creator: string
  description: string
  createdAt: u64
  likes: string[]
  tags: string[]
  status: string
  claimer: string
  funders: Fund[]
  logs: Log[]

  constructor(id: number, title: string, description: string) {
    this.id = id
    this.title = title
    this.creator = context.sender
    this.description = description
    this.createdAt = context.blockTimestamp
    this.likes = []
    this.status = 'pending'
    this.funders = []
    this.claimer = ''
  }

  like(): void {
    assert(
      !this.likes.includes(context.sender),
      'You already liked this bounty'
    )
    this.likes.push(context.sender)
  }

  isOwner(): ContractPromise {
    const name = context.contractName.split('.')[0]
    const promise = ContractPromise.create(
      FACTORY_CONTRACT,
      'getDAO',
      { name },
      100000000000000
    )
    return promise
  }

  reject(message: string): void {
    // only owner of dao
    if (this.status !== STATUS.PENDING) {
      return assert(
        false,
        'Bounty is ' + this.status + ', you can only reject pending bounty'
      )
    }
    this.status = STATUS.REJECTED
    const log = new Log(STATUS.REJECTED, message)
    this.logs.push(log)
  }

  accept(message: string): void {
    // only owner of dao
    if (this.status !== STATUS.PENDING) {
      return assert(
        false,
        'Bounty is ' + this.status + ', you can only accept pending bounty'
      )
    }
    this.status = STATUS.ACCEPTED
    const log = new Log(STATUS.ACCEPTED, message)
    this.logs.push(log)
  }

  start(message: string): void {
    // only owner of dao
    if (this.status !== STATUS.ACCEPTED) {
      return assert(
        false,
        'Bounty is ' + this.status + ', you can only start a accepted bounty'
      )
    }
    this.status = STATUS.IN_PROGRESS
    const log = new Log(STATUS.IN_PROGRESS, message)
    this.logs.push(log)
  }

  finish(claimer: string, message: string): void {
    // only owner of dao
    if (this.status !== STATUS.IN_PROGRESS) {
      return assert(
        false,
        'Bounty is ' +
          this.status +
          ', you can only finish a in-progress bounty'
      )
    }
    this.status = STATUS.DONE
    this.claimer = claimer
    const log = new Log(
      STATUS.DONE,
      message + '\n' + claimer + ' is set into claimer'
    )
    this.logs.push(log)
  }

  close(message: string): void {
    this.status = STATUS.CLOSED
    const log = new Log(STATUS.DONE, message)
    this.logs.push(log)
    // return fund to funders
  }

  fund(amount: u128): void {
    const fund = new Fund(amount)
    this.funders.push(fund)
  }
}

export const bounties = new PersistentUnorderedMap<string, BetterBounty>(
  'BetterBounty'
)
