use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{OutputReference, ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

type Datum {
  owner: VerificationKeyHash,
  redeemer: VerificationKeyHash,
}

validator(_: OutputReference) {
  fn claimable_ada_link(
    datum: Datum,
    _redeemer: Void,
    ctx: ScriptContext,
  ) -> Bool {
    when ctx.purpose is {
      Spend(_) -> must_be_signed_by(ctx.transaction, datum.redeemer)
      _ -> False
    }
  }
}

fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}
