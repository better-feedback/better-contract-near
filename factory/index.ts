import { ContractPromiseBatch, context, u128, base58, env } from 'near-sdk-as'
import { BetterDAOFactory } from './model'

const CODE = includeBytes('../build/feedbackdao/release.wasm')

/// This gas spent on the call & account creation, the rest goes to the `new` call.
const CREATE_CALL_GAS: u64 = 40000000000000

const contract: BetterDAOFactory = new BetterDAOFactory()

export function getDaoList(): Array<string> {
  return contract.daos.values()
}

export function deleteDAO(name: string): void {
  assert(contract.daos.has(name), 'DAO does not exist')
  // assert(context.contractName !== context.sender, 'Only owner can delete')
  contract.daos.delete(name)
  ContractPromiseBatch.create(name).delete_account(name)
}

export function create(name: string, args: Uint8Array): void {
  let accountId = name + '.' + context.contractName
  assert(!contract.daos.has(accountId), 'Dao name already exists')
  contract.daos.add(accountId)
  // 1 Near
  const minAmount = u128.fromString('1000000000000000000000000')
  let promise = ContractPromiseBatch.create(accountId)
    .create_account()
    .transfer(minAmount)
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
    .add_full_access_key(base58.decode(context.senderPublicKey))

  promise.function_call(
    'init',
    args,
    u128.Zero,
    env.prepaid_gas() - CREATE_CALL_GAS
  )
}
