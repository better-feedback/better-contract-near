import { context, u128, PersistentUnorderedMap } from 'near-sdk-as'

class Fund {
  amount: u128
  funder: string

  constructor(amount: u128) {
    this.amount = amount
    this.funder = context.sender
  }
}

@nearBindgen
export class BetterBounty {
  id: number
  title: string
  creator: string
  description: string
  createdAt: u64
  likes: string[]
  status: string
  claimer: string
  funders: Fund[]

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

  decline(): void {
    // only owner of dao
    this.status = 'decline'
  }

  accept(): void {
    // only owner of dao
    this.status = 'accept'
  }

  start(): void {
    // only owner of dao
    this.status = 'inprogress'
  }

  finish(claimer: string): void {
    // only owner of dao
    this.status = 'done'
    this.claimer = claimer
  }

  close(): void {
    // only owner of dao
    this.status = 'closed'
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
