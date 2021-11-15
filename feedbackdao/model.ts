import {
  PersistentSet,
  PersistentVector,
  PersistentMap,
  PersistentUnorderedMap,
  u128,
  context,
} from 'near-sdk-as'
import { AccountId, Balance, Duration } from './types'

export enum Vote {
  Yes,
  No,
}

export enum Status {
  UnderReview,
  Accepted,
  Rejected,
  InProgress,
  Completed,
}

@nearBindgen
export class Fund {
  amount: u128
  funder: string

  constructor(amount: u128) {
    this.amount = amount
    this.funder = context.sender
  }
}

@nearBindgen
export class Log {
  timestamp: u64
  message: string
  status: Status
  sender: string

  constructor(status: i32, message: string) {
    this.status = status
    this.message = message
    this.timestamp = context.blockTimestamp
    this.sender = context.sender
  }
}

export class FeedbackType {
  id: number
  title: string
  description: string
  tags: string[]
  createdAt: u64
  createdBy: string
  likes: AccountId[]
  status: Status
  hunter: AccountId[]
  funds: Fund[]
  logs: Log[]
}

@nearBindgen
export class Feedback {
  id: number
  title: string
  description: string
  tags: string[]
  createdAt: u64
  createdBy: string
  likes: PersistentSet<AccountId>
  status: Status
  hunter: PersistentSet<AccountId>
  funds: PersistentSet<Fund>
  logs: PersistentSet<Log>

  constructor(id: number, title: string, description: string, tags: string[]) {
    const prefix = id.toString() + '-'
    this.id = id
    this.title = title
    this.description = description
    this.tags = tags
    this.createdAt = context.blockTimestamp
    this.createdBy = context.sender
    this.likes = new PersistentSet<AccountId>(prefix + '-likes')
    this.status = Status.UnderReview
    this.hunter = new PersistentSet<AccountId>(prefix + 'hunter')
    this.funds = new PersistentSet<Fund>(prefix + 'funds')
    this.logs = new PersistentSet<Log>(prefix + 'logs')
    this.logs.add(new Log(Status.UnderReview, 'Create this feedback'))
  }

  getFlat(): FeedbackType {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      tags: this.tags,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
      likes: this.likes.values(),
      status: this.status,
      hunter: this.hunter.values(),
      funds: this.funds.values(),
      logs: this.logs.values(),
    }
  }
}

@nearBindgen
export class FeedbackDAO {
  projectUrl: string
  logoUrl: string
  description: string
  createdAt: u64
  createdBy: AccountId
  council: PersistentSet<AccountId>
  feedbacks: PersistentUnorderedMap<u32, Feedback>

  constructor(projectUrl: string, logoUrl: string, description: string) {
    this.projectUrl = projectUrl
    this.logoUrl = logoUrl
    this.description = description
    this.createdAt = context.blockTimestamp
    this.feedbacks = new PersistentUnorderedMap<u32, Feedback>('feedbacks')
    this.council = new PersistentSet<AccountId>('council')
  }
}

@nearBindgen
export class FeedbackInfo {
  projectUrl: string
  logoUrl: string
  description: string
  createdAt: u64
  councilCount: number
  feedbackCount: number
}
