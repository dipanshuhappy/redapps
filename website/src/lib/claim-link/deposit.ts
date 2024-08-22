import { deserializeAddress, mConStr0, Transaction } from "@meshsdk/core";
import {
  getClaimLinkScript,
  getTxBuilder,
  getUtxoOfAddress,
} from "../offchain";

export async function depositAsset({
  redeemer,
  owner,
  amount,
}: {
  redeemer: string;
  owner: string;
  amount: number;
}) {
  const utxos = await getUtxoOfAddress(owner);

  console.log({ utxos });

  const { address: scriptAddress } = getClaimLinkScript(
    utxos[utxos.length - 1].input,
  );

  console.log({ scriptAddress });

  const { pubKeyHash: ownerPubkeyHash } = deserializeAddress(owner);
  const { pubKeyHash: redeemerPubkeyHash } = deserializeAddress(redeemer);

  console.log({ ownerPubkeyHash, redeemerPubkeyHash });
  const txBuilder = getTxBuilder();

  return txBuilder.txHex;
}
