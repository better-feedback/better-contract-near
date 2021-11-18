import {
  PersistentSet,
  PersistentVector,
  PersistentMap,
  PersistentUnorderedMap,
  u128,
  context,
} from 'near-sdk-as'
import { AccountId, Balance, Duration } from './types'

export enum Status {
  Open,
  Planned,
  Closed,
  InProgress,
  Completed,
}

export enum LogType {
  Status,
  Comment,
  Fund,
  Contribution,
}

export enum ExperienceLevel {
  Beginner,
  Intermediate,
  Advanced,
}

@nearBindgen
export class Fund {
  amount: Balance
  funder: string
  timestamp: u64

  constructor(amount: Balance) {
    this.amount = amount
    this.funder = context.sender
    this.timestamp = context.blockTimestamp
  }
}

@nearBindgen
export class Log {
  timestamp: u64
  message: string
  logType: LogType
  sender: string
  status: Status

  constructor(logType: LogType, message: string, status: Status) {
    this.logType = logType
    this.message = message
    this.timestamp = context.blockTimestamp
    this.sender = context.sender
    this.status = status
  }
}

@nearBindgen
export class Applicant {
  timestamp: u64
  approved: boolean
  message: string
  applicant: string
  bountyGoal: Balance

  constructor(bountyGoal: Balance, message: string) {
    this.bountyGoal = bountyGoal
    this.message = message
    this.applicant = context.sender
    this.timestamp = context.blockTimestamp
    this.approved = false
  }
}

@nearBindgen
export class Issue {
  id: number
  title: string
  description: string
  tags: string[]
  createdAt: u64
  createdBy: string
  fundable: boolean
  status: Status
  experienceLevel: ExperienceLevel
  category: string
  likes: PersistentSet<AccountId>
  hunter: PersistentSet<AccountId>
  funds: PersistentSet<Fund>
  logs: PersistentSet<Log>

  constructor(
    id: number,
    title: string,
    description: string,
    category: string
  ) {
    const prefix = id.toString() + '-'
    this.id = id
    this.title = title
    this.description = description
    this.category = category
    this.tags = []
    this.createdAt = context.blockTimestamp
    this.createdBy = context.sender
    this.likes = new PersistentSet<AccountId>(prefix + '-likes')
    this.status = Status.Open
    this.hunter = new PersistentSet<AccountId>(prefix + 'hunter')
    this.funds = new PersistentSet<Fund>(prefix + 'funds')
    this.logs = new PersistentSet<Log>(prefix + 'logs')
    this.logs.add(new Log(LogType.Status, 'Create this feedback', Status.Open))
  }
}

@nearBindgen
export class IssueDAO {
  info: PersistentMap<string, string>
  council: PersistentSet<AccountId>
  issues: PersistentUnorderedMap<u32, Issue>
  categories: PersistentSet<string>

  constructor(
    projectUrl: string,
    logoUrl: string,
    description: string,
    categories: string[]
  ) {
    this.info = new PersistentMap<string, string>('info')
    // this.info.set('projectUrl', projectUrl)
    // this.info.set('logoUrl', logoUrl)
    // this.info.set('description', description)
    // this.info.set('createdAt', context.blockTimestamp.toString())
    // this.info.set('createdBy', context.sender)
    this.issues = new PersistentUnorderedMap<u32, Issue>('issues')
    this.council = new PersistentSet<AccountId>('council')
    this.categories = new PersistentSet<string>('categories')
    for (let i = 0; i < categories.length; ++i) {
      this.categories.add(categories[i])
    }
  }
}

export class DAOInfoType {
  logoUrl: string
  projectUrl: string
  description: string
  createdAt: string
  createdBy: string
}
