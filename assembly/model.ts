import { context, PersistentUnorderedMap } from 'near-sdk-as'

@nearBindgen
export class BetterDAO {
  name: string
  owner: string
  url: string
  logoUrl: string
  description: string
  createdAt: u64

  constructor(name: string, url: string, description: string, logoUrl: string) {
    this.name = name
    this.owner = context.sender
    this.url = url
    this.logoUrl = logoUrl
    this.description = description
    this.createdAt = context.blockTimestamp
  }
}

export const daos = new PersistentUnorderedMap<string, BetterDAO>('BetterDAO')
