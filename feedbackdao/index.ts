import {
  ContractPromiseBatch,
  PersistentSet,
  context,
  base58,
  u128,
  env,
  PersistentVector,
  PersistentMap,
  logging,
} from 'near-sdk-as'
import { AccountId, Balance, Duration } from './types'
import { Feedback, FeedbackDAO, FeedbackInfo, FeedbackType } from './model'

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

  return dao
}

export function getDAO(): FeedbackDAO {
  return dao
}

export function getInfo(): FeedbackInfo {
  return dao.getInfo()
}

export function getFeedbacks(): Feedback[] {
  return dao.feedbacks.values()
}

export function createFeedback(
  title: string,
  description: string,
  tags: string[]
): void {
  const fb = new Feedback(dao.feedbacks.size, title, description, tags)
  dao.feedbacks.add(fb)
}

export function getFeedback(id: i32): FeedbackType {
  const fb = dao.feedbacks.values()[id]
  assert(fb != null, 'Feedback does not exist')
  return fb.unwrap()
}

export function likeFeedback(id: i32): void {
  const fb = dao.feedbacks.values()[id]
  assert(fb != null, 'Feedback does not exist')
  fb.likes.add(context.sender)
}

export function getLikes(id: i32): AccountId[] {
  const fb = dao.feedbacks.values()[id]
  assert(fb != null, 'Feedback does not exist')
  return fb.likes.values()
}
