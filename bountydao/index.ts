import { context } from 'near-sdk-as'
import { bounties, BetterBounty } from './model'

let last_bounty_id = 0

export function createBounty(title: string, description: string): void {
  const bounty = new BetterBounty(last_bounty_id, title, description)
  bounties.set(last_bounty_id.toString(), bounty)
  last_bounty_id++
}

export function getBounty(id: string): BetterBounty | null {
  const bounty = bounties.get(id, null)
  return bounty
}

export function getAllBounties(): BetterBounty[] {
  return bounties.values()
}

export function like(id: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.like()
    bounties.set(id, bounty)
  }
}

export function reject(id: string, message: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.reject(message)
  }
}

export function accept(id: string, message: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.accept(message)
  }
}

export function start(id: string, message: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.start(message)
  }
}

export function finish(id: string, claimer: string, message: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.finish(claimer, message)
  }
}

export function close(id: string, message: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.close(message)
  }
}
