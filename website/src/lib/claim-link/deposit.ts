import {
  getClaimLinkScript,
  ClaimLinkDatumType,
  ClaimLinkDatum,
} from "../offchain";
import { Lucid, Data } from "lucid-cardano";

export async function depositAsset({
  redeemer,
  owner,
  amount,
  lucid,
  assetId,
}: {
  redeemer: string;
  owner: string;
  amount: number;
  lucid: Lucid;
  assetId: string;
}) {
  const utxos = await lucid.wallet.getUtxos();
  console.log({ utxos });
  const outputIndex = utxos[utxos.length - 1].outputIndex;
  const txHash = utxos[utxos.length - 1].txHash;
  const { address: scriptAddress } = getClaimLinkScript(
    {
      outputIndex,
      txHash,
    },
    lucid,
  );

  console.log({ scriptAddress });

  console.log({ owner });
  console.log({ redeemer });
  const ownerPubkey =
    lucid.utils.getAddressDetails(owner).paymentCredential?.hash;
  const redeemerPubkey =
    lucid.utils.getAddressDetails(redeemer).paymentCredential?.hash;

  if (!ownerPubkey) {
    throw new Error("Owner address is invalid");
  }
  if (!redeemerPubkey) {
    throw new Error("Redeemer address is invalid");
  }
  const datum = Data.to<ClaimLinkDatumType>(
    {
      owner: ownerPubkey,
      redeemer: redeemerPubkey,
    },
    ClaimLinkDatum,
  );

  console.log({ assetId });
  console.log({ datum });

  const tx = await lucid
    .newTx()
    .payToContract(
      scriptAddress,
      { inline: datum },
      {
        [assetId]: BigInt(amount),
      },
    )
    .complete();

  console.log({ tx });

  const signedTx = await tx.sign().complete();

  return { signedTx, scriptAddress, outputIndex, txHash };
}
