import { context, PersistentUnorderedMap } from 'near-sdk-as'

@nearBindgen
export class BetterDAO {
  name: string
  owner: string
  url: string
  logoUrl: string
  description: string
  createdAt: u64

  constructor(name: string, url: string, logoUrl: string, description: string) {
    this.name = name
    this.owner = context.sender
    this.url = url
    this.logoUrl = logoUrl
    this.description = description
    this.createdAt = context.blockTimestamp
  }

  updateMetadata(url: string, logoUrl: string, description: string): void {
    this.url = url
    this.logoUrl = logoUrl
    this.description = description
  }
}

export const daos = new PersistentUnorderedMap<string, BetterDAO>('BetterDAO')
