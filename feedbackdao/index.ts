import { context } from 'near-sdk-as'
import { AccountId } from './types'
import {
  Issue,
  IssueDAO,
  Status,
  Fund,
  Log,
  LogType,
  DAOInfoType,
} from './model'

const MAX_DESCRIPTION_LENGTH: u32 = 280

let dao: IssueDAO = new IssueDAO('', '', '', [])

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
  // dao = new IssueDAO(projectUrl, logoUrl, description, categories)
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

export function getDAO(): IssueDAO {
  return dao
}

export function getDAOInfo(): DAOInfoType {
  return {
    logoUrl: dao.info.get('logoUrl', '') as string,
    projectUrl: dao.info.get('projectUrl', '') as string,
    description: dao.info.get('description', '') as string,
    createdAt: dao.info.get('createdAt', '') as string,
    createdBy: dao.info.get('createdBy', '') as string,
  }
}

export function getCategories(): string[] {
  return dao.categories.values()
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

export function getIssues(): Issue[] {
  return dao.issues.values()
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

export function acceptIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can accept')
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    assert(fb.status == Status.Open, 'Issue is not under review')
    fb.logs.add(new Log(LogType.Status, 'Accept this feedback', Status.Planned))
    fb.status = Status.Planned
    dao.issues.set(id, fb)
  }
}

export function rejectIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can reject')
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    assert(fb.status == Status.Open, 'Issue is not under review')
    fb.logs.add(new Log(LogType.Status, 'Closed this feedback', Status.Closed))
    fb.status = Status.Closed
    dao.issues.set(id, fb)
  }
}

export function startIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can start')
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    assert(fb.status == Status.Planned, 'Issue not accepted yet')
    fb.logs.add(
      new Log(LogType.Status, 'Start this feedback', Status.InProgress)
    )
    fb.status = Status.InProgress
    dao.issues.set(id, fb)
  }
}

export function completeIssue(id: u32): void {
  const fb = dao.issues.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can complete')
  assert(fb != null, 'Issue does not exist')
  if (fb) {
    assert(fb.status == Status.InProgress, 'Issue not started yet')
    fb.logs.add(
      new Log(LogType.Status, 'Complete this feedback', Status.Completed)
    )
    fb.status = Status.Completed
    dao.issues.set(id, fb)
  }
}
