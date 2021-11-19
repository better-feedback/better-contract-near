import { context, u128, ContractPromiseBatch } from 'near-sdk-as'
import { AccountId, Balance } from './types'
import {
  Issue,
  IssueDAO,
  Status,
  Fund,
  Log,
  LogType,
  DAOInfoType,
  ExperienceLevel,
  Applicant,
  IssueInfoType,
} from './model'

const MAX_DESCRIPTION_LENGTH: u32 = 280

let dao: IssueDAO = new IssueDAO()

export function init(
  projectUrl: string,
  logoUrl: string,
  description: string,
  categories: string[]
): IssueDAO {
  assert(
    <u32>description.length < MAX_DESCRIPTION_LENGTH,
    'Description length is too long'
  )
  dao.info.set('projectUrl', projectUrl)
  dao.info.set('logoUrl', logoUrl)
  dao.info.set('description', description)
  dao.info.set('createdAt', context.blockTimestamp.toString())
  dao.info.set('createdBy', context.sender)
  for (let i = 0; i < categories.length; ++i) {
    dao.categories.add(categories[i])
  }
  dao.council.add(context.sender)

  return dao
}

export function updateDAO(
  projectUrl: string,
  logoUrl: string,
  description: string,
  categories: string[]
): void {
  dao.info.set('projectUrl', projectUrl)
  dao.info.set('logoUrl', logoUrl)
  dao.info.set('description', description)
  dao.categories.clear()
  for (let i = 0; i < categories.length; ++i) {
    dao.categories.add(categories[i])
  }
}

export function createIssue(
  title: string,
  description: string,
  category: string
): void {
  const id = dao.issues.keys().length
  const fb = new Issue(id, title, description, category)
  dao.issues.set(id, fb)
}

export function updateIssue(
  id: u32,
  title: string,
  description: string,
  category: string
): void {
  const fb = dao.issues.get(id, null)
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(
      dao.council.has(context.sender),
      'Only council and creator can update'
    )
    assert(fb.status !== Status.Closed, 'Issue is already closed')
    fb.title = title
    fb.description = description
    fb.category = category
    fb.logs.add(new Log(LogType.Edit, 'Edit this issue', fb.status))
    dao.issues.set(id, fb)
  }
}

export function approveIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can accept')
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(fb.status == Status.Open, 'Issue is not under review')
    fb.logs.add(new Log(LogType.Status, 'Accept this issue', Status.Planned))
    fb.status = Status.Planned
    dao.issues.set(id, fb)
  }
}

export function closeIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can reject')
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(fb.status === Status.Open, 'Issue is not under review')
    fb.logs.add(new Log(LogType.Status, 'Closed this issue', Status.Closed))
    fb.status = Status.Closed
    dao.issues.set(id, fb)
  }
}

export function startIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can start')
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(fb.status === Status.Planned, 'Issue not accepted yet')
    fb.logs.add(new Log(LogType.Status, 'Start this issue', Status.InProgress))
    fb.status = Status.InProgress
    dao.issues.set(id, fb)
  }
}

export function completeIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can complete')
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(fb.status === Status.InProgress, 'Issue not started yet')
    fb.logs.add(
      new Log(LogType.Status, 'Complete this issue', Status.Completed)
    )
    fb.status = Status.Completed
    dao.issues.set(id, fb)
  }
}

export function issueToBounty(id: u32, exLv: ExperienceLevel): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can complete')
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    assert(fb.status !== Status.Completed, 'Issue completed yet')
    assert(fb.status !== Status.Closed, 'Issue closed yet')
    assert(fb.status !== Status.Open, 'Issue not planned yet')
    fb.fundable = true
    fb.experienceLevel = exLv
    dao.issues.set(id, fb)
  }
}

export function applyIssue(id: u32, goal: Balance, message: string): void {
  const fb = dao.issues.get(id, null)
  assert(fb !== null, 'Issue does not exist')
  if (fb && fb.fundable) {
    assert(fb.status !== Status.Completed, 'Issue has completed yet')
    const apply = new Applicant(goal, message)
    fb.applicants.add(apply)
    fb.logs.add(new Log(LogType.Apply, 'Apply this issue', fb.status))
    dao.issues.set(id, fb)
  }
}

export function addComment(id: u32, comment: string): void {
  const fb = dao.issues.get(id, null)
  assert(fb !== null, 'Issue does not exist')
  if (fb) {
    fb.logs.add(new Log(LogType.Comment, comment, fb.status))
    dao.issues.set(id, fb)
  }
}

export function fundIssue(id: u32, amount: Balance): void {
  const fb = dao.issues.get(id, null)
  assert(fb !== null, 'Issue does not exist')
  if (fb && fb.fundable) {
    assert(context.accountBalance >= amount, 'Balance not enough ')
    fb.funds.add(new Fund(amount))
    fb.logs.add(new Log(LogType.Fund, 'Fund this issue', fb.status))
    dao.issues.set(id, fb)
  }
}

export function getDAOInfo(): DAOInfoType {
  return {
    logoUrl: dao.info.get('logoUrl', '') as string,
    projectUrl: dao.info.get('projectUrl', '') as string,
    description: dao.info.get('description', '') as string,
    createdAt: dao.info.get('createdAt', '') as string,
    createdBy: dao.info.get('createdBy', '') as string,
    categories: dao.categories.values(),
    council: dao.council.values(),
  }
}

export function getIssueInfo(id: u32): IssueInfoType | null {
  const fb = dao.issues.get(id, null)
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    return {
      id: fb.id,
      title: fb.title,
      description: fb.description,
      tags: fb.tags,
      createdAt: fb.createdAt,
      createdBy: fb.createdBy,
      category: fb.category,
      status: fb.status,
      logs: fb.logs.values(),
      experienceLevel: fb.experienceLevel,
      fundable: fb.fundable,
      funds: fb.funds.values(),
      applicants: fb.applicants.values(),
      likes: fb.likes.values(),
    }
  }
  return null
}

export function getCategories(): string[] {
  return dao.categories.values()
}

export function getIssues(): Issue[] {
  return dao.issues.values()
}

export function getIssue(id: u32): Issue | null {
  return dao.issues.get(id, null)
}

export function likeIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    fb.likes.add(context.sender)
    dao.issues.set(id, fb)
  }
}

export function getLikes(id: u32): AccountId[] {
  const fb = dao.issues.get(id, null)
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    return fb.likes.values()
  }
  return []
}

export function getFunds(id: u32): Fund[] {
  const fb = dao.issues.get(id, null)
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    return fb.funds.values()
  }
  return []
}

export function getCouncil(): AccountId[] {
  return dao.council.values()
}

export function getLogs(id: u32): Log[] {
  const fb = dao.issues.get(id, null)
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    return fb.logs.values()
  }
  return []
}

export function getIssuesByCategory(category: string): Issue[] {
  const result = new Array<Issue>()
  const issues = dao.issues.values()
  for (let index = 0; index < issues.length; index++) {
    if (issues[index].category == category) {
      result.push(issues[index])
    }
  }
  return result
}

export function getIssuesByStatus(status: Status): Issue[] {
  const result = new Array<Issue>()
  const issues = dao.issues.values()
  for (let index = 0; index < issues.length; index++) {
    if (issues[index].status == status) {
      result.push(issues[index])
    }
  }
  return result
}

export function getIssuesCountByCategory(category: string): i32 {
  let result = 0
  const issues = dao.issues.values()
  for (let index = 0; index < issues.length; index++) {
    if (issues[index].category == category) {
      result++
    }
  }
  return result
}

export function getIssuesCountByStatus(status: Status): i32 {
  let result = 0
  const issues = dao.issues.values()
  for (let index = 0; index < issues.length; index++) {
    if (issues[index].status == status) {
      result++
    }
  }
  return result
}
