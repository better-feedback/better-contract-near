import { context } from 'near-sdk-as'
import { AccountId, Balance, Duration } from './types'
import { Feedback, FeedbackDAO, Status, Fund, Log } from './model'

const MAX_DESCRIPTION_LENGTH: u32 = 280

let dao: FeedbackDAO = new FeedbackDAO('', '', '')

export function init(
  projectUrl: string,
  logoUrl: string,
  description: string
): FeedbackDAO {
  assert(
    <u32>description.length < MAX_DESCRIPTION_LENGTH,
    'Description length is too long'
  )
  dao.projectUrl = projectUrl
  dao.logoUrl = logoUrl
  dao.description = description
  dao.council.add(context.sender)
  dao.createdBy = context.sender

  return dao
}

export function getDAO(): FeedbackDAO {
  return dao
}

export function getFeedbacks(): Feedback[] {
  return dao.feedbacks.values()
}

export function createFeedback(
  title: string,
  description: string,
  tags: string[]
): void {
  const id = dao.feedbacks.keys().length
  const fb = new Feedback(id, title, description, tags)
  dao.feedbacks.set(id, fb)
}

export function getFeedback(id: u32): Feedback | null {
  return dao.feedbacks.get(id, null)
}

export function likeFeedback(id: u32): void {
  const fb = dao.feedbacks.get(id, null)
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    fb.likes.add(context.sender)
    dao.feedbacks.set(id, fb)
  }
}

export function getLikes(id: u32): AccountId[] {
  const fb = dao.feedbacks.get(id, null)
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    return fb.likes.values()
  }
  return []
}

export function getFunds(id: u32): Fund[] {
  const fb = dao.feedbacks.get(id, null)
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    return fb.funds.values()
  }
  return []
}

export function getCouncil(): AccountId[] {
  return dao.council.values()
}

export function getLogs(id: u32): Log[] {
  const fb = dao.feedbacks.get(id, null)
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    return fb.logs.values()
  }
  return []
}

export function acceptFeedback(id: u32): void {
  const fb = dao.feedbacks.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can accept')
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    assert(fb.status == Status.UnderReview, 'Feedback is not under review')
    fb.logs.add(new Log(Status.Accepted, 'Accept this feedback'))
    fb.status = Status.Accepted
    dao.feedbacks.set(id, fb)
  }
}

export function rejectFeedback(id: u32): void {
  const fb = dao.feedbacks.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can reject')
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    assert(fb.status == Status.UnderReview, 'Feedback is not under review')
    fb.logs.add(new Log(Status.Rejected, 'Reject this feedback'))
    fb.status = Status.Rejected
    dao.feedbacks.set(id, fb)
  }
}

export function startFeedback(id: u32): void {
  const fb = dao.feedbacks.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can start')
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    assert(fb.status == Status.Accepted, 'Feedback not accepted yet')
    fb.logs.add(new Log(Status.InProgress, 'Start this feedback'))
    fb.status = Status.InProgress
    dao.feedbacks.set(id, fb)
  }
}

export function completeFeedback(id: u32): void {
  const fb = dao.feedbacks.get(id, null)
  assert(dao.council.has(context.sender), 'Only council members can complete')
  assert(fb != null, 'Feedback does not exist')
  if (fb) {
    assert(fb.status == Status.InProgress, 'Feedback not started yet')
    fb.logs.add(new Log(Status.Completed, 'Complete this feedback'))
    fb.status = Status.Completed
    dao.feedbacks.set(id, fb)
  }
}
