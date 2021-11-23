import {
  PersistentSet,
  PersistentMap,
  PersistentUnorderedMap,
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
  Apply,
  Edit,
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
  claimed: boolean

  constructor(message: string) {
    this.message = message
    this.applicant = context.sender
    this.timestamp = context.blockTimestamp
    this.approved = false
    this.claimed = false
  }
}

@nearBindgen
export class Issue {
  id: u32
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
  applicants: PersistentSet<Applicant>
  funds: PersistentSet<Fund>
  logs: PersistentSet<Log>

  constructor(id: u32, title: string, description: string, category: string) {
    const prefix = id.toString() + '-'
    this.id = id
    this.title = title
    this.description = description
    this.category = category
    this.tags = []
    this.experienceLevel = ExperienceLevel.Beginner
    this.createdAt = context.blockTimestamp
    this.createdBy = context.sender
    this.likes = new PersistentSet<AccountId>(prefix + 'likes')
    this.status = Status.Open
    this.applicants = new PersistentSet<Applicant>(prefix + 'applicants')
    this.funds = new PersistentSet<Fund>(prefix + 'funds')
    this.logs = new PersistentSet<Log>(prefix + 'logs')
    this.logs.add(new Log(LogType.Status, 'Create this issue', Status.Open))
  }
}

@nearBindgen
export class IssueDAO {
  info: PersistentMap<string, string>
  council: PersistentSet<AccountId>
  issues: PersistentUnorderedMap<u32, Issue>
  categories: PersistentSet<string>

  constructor() {
    this.info = new PersistentMap<string, string>('info')
    this.issues = new PersistentUnorderedMap<u32, Issue>('issues')
    this.council = new PersistentSet<AccountId>('council')
    this.categories = new PersistentSet<string>('categories')
  }
}

@nearBindgen
export class DAOInfoType {
  logoUrl: string
  projectUrl: string
  description: string
  createdAt: string
  createdBy: string
  categories: string[]
  council: string[]
}

@nearBindgen
export class IssueInfoType {
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
  likes: AccountId[]
  applicants: Applicant[]
  funds: Fund[]
  logs: Log[]
}
