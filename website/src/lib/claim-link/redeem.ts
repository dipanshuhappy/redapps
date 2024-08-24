import { Lucid, Data, Address, Blockfrost, WalletApi } from "lucid-cardano";
import {
  ClaimLinkDatumType,
  ClaimLinkDatum,
  getClaimLinkScript,
} from "../offchain";
export async function redeemAsset({
  txHash,
  key,
  lucid,
  outputIndex,
  providerId,
}: {
  txHash: string;
  key: string;
  lucid: Lucid;
  providerId: string;
  outputIndex: number;
}) {
  const {
    address: scriptAddress,
    script,
    type,
  } = getClaimLinkScript(
    {
      outputIndex,
      txHash,
    },
    lucid,
  );
  const allUtxos = await lucid.utxosAt(scriptAddress as Address);
  console.log(allUtxos);

  const redeemLucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", providerId),
    "Preprod",
  );
  redeemLucid.selectWalletFromPrivateKey(key);

  const redeemAddress = await redeemLucid.wallet.address();

  console.log({ redeemAddress });

  const utxos = allUtxos.filter((utxo) => {
    if (utxo.datum) {
      let datum = Data.from<ClaimLinkDatumType>(utxo.datum, ClaimLinkDatum);

      return true;
    }
    return false;
  });

  if (!utxos.length) throw new Error(`gift card is empty`);

  const redeemerPubkey =
    lucid.utils.getAddressDetails(redeemAddress).paymentCredential?.hash;
  const myAddress = await lucid.wallet.address();
  // const tx = lucid
  //   .newTx()
  //   .collectFrom(utxos, Data.empty())
  //   .attachSpendingValidator({
  //     script,
  //     type,
  //   });
  // let oldWallet = lucid.wallet;
  // lucid.selectWalletFromPrivateKey(key);
  // const finalTx = tx.addSigner(await lucid.wallet.address()).complete();
  // lucid.selectWallet(oldWallet as any as WalletApi);
  // const signedTx = finalTx.si
  //
  const tx = lucid
    .newTx()
    .collectFrom(utxos, Data.empty())
    .attachSpendingValidator({
      script,
      type,
    })
    .addSigner(redeemAddress)
    .complete();

  const txSignedWithRedeemer = (await tx).signWithPrivateKey(key);

  const signedTx = await txSignedWithRedeemer.sign().complete();
  return { signedTx };
}
