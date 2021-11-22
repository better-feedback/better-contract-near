import { PersistentSet } from 'near-sdk-as'

@nearBindgen
export class BetterDAOFactory {
  daos: PersistentSet<string>

  constructor() {
    this.daos = new PersistentSet<string>('daolist')
  }
}
