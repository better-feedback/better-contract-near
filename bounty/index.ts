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

export function decline(id: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.decline()
  }
}

export function accept(id: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.accept()
  }
}

export function start(id: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.start()
  }
}

export function finish(id: string, claimer: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.finish(claimer)
  }
}

export function close(id: string): void {
  const bounty = bounties.get(id, null)
  assert(bounty != null, 'bounty not found')
  if (bounty) {
    bounty.close()
  }
}
