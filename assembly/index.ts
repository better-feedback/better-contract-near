import { context, ContractPromiseBatch, base58, u128 } from 'near-sdk-as'
import { BetterDAO, daos } from './model'

const CODE = includeBytes('../build/bounty/release.wasm')

export function getDAOs(): BetterDAO[] {
  return daos.values()
}

export function createDAO(
  name: string,
  url: string,
  logoUrl: string,
  description: string
): void {
  assert(!daos.contains(name), 'DAO already exists')

  const sub_account_id = name + '.' + context.contractName

  // 1 Near
  const minAmount = u128.fromString('1000000000000000000000000')
  assert(context.accountBalance >= minAmount, 'Not enough balance')

  ContractPromiseBatch.create(sub_account_id)
    .create_account()
    .transfer(minAmount)
    .add_full_access_key(base58.decode(context.senderPublicKey))
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))

  const dao = new BetterDAO(name, url, logoUrl, description)

  daos.set(name, dao)
}
