type RelinkConfig = {
  baseUrl: string;
  blockfrostId: string;
  blockFrostUrl: string;
  network: Network;
  walletApi: any;
};
import { blueprint } from "./blueprint";
import { Lucid, Data, Blockfrost, Network, OutRef, Address } from "lucid-cardano";
import { txOutRef } from "@meshsdk/common";
import { applyParamsToScript } from "@meshsdk/core-csl";
type ScriptType = "PlutusV2";
interface Script {
  type: ScriptType;
  script: string;
  address: string;
}

export const ClaimLinkDatum = Data.Object({
  owner: Data.String,
  redeemer: Data.String,
});
export type ClaimLinkDatumType = Data.Static<typeof ClaimLinkDatum>;

export class Relink {
  baseUrl: string;
  blockfrostId: string;
  blockFrostUrl: string;
  network: Network;

  lucid: Lucid;

  constructor(baseUrl: string, lucid: Lucid, blockfrostId: string, blockFrostUrl: string, network: Network) {
    this.baseUrl = baseUrl;
    this.lucid = lucid;
    this.blockfrostId = blockfrostId;
    this.blockFrostUrl = blockFrostUrl;
    this.network = network;
  }

  static async new(config: RelinkConfig) {
    const lucid = await Lucid.new(new Blockfrost(config.blockFrostUrl, config.blockfrostId), config.network);
    lucid.selectWallet(config.walletApi);

    return new Relink(config.baseUrl, lucid, config.blockfrostId, config.blockFrostUrl, config.network);
  }

  async createWalletAndKeyPair() {
    const lucid = await Lucid.new(new Blockfrost(this.blockFrostUrl, this.blockfrostId), this.network);
    const key = this.lucid.utils.generatePrivateKey();
    this.lucid.selectWalletFromPrivateKey(key);
    const address = await lucid.wallet.address();
    return {
      key,
      address,
    };
  }

  getClaimLinkScript(outputRef: OutRef) {
    const codeCbor = applyParamsToScript(
      blueprint.validators[0].compiledCode,
      [txOutRef(outputRef.txHash, outputRef.outputIndex)],
      "JSON",
    );

    const script: Script = {
      type: "PlutusV2",
      script: codeCbor,
      address: this.lucid.utils.validatorToAddress({
        script: codeCbor,
        type: "PlutusV2",
      }),
    };

    return script;
  }

  async depositAndGenerateLink({ amount, assetId, owner }: { owner: string; amount: number; assetId: string }) {
    const { k, oh, oi } = await this.generateLinkValues({ amount, assetId, owner });
    const url = new URL(this.baseUrl);
    url.searchParams.append("k", k);
    url.searchParams.append("oi", oi.toString());
    url.searchParams.append("oh", oh);
    return url;
  }

  async redeemAssetAndSubmit({ txHash, key, outputIndex }: { txHash: string; key: string; outputIndex: number }) {
    const signedTx = await this.redeemAsset({ txHash, key, outputIndex });
    return signedTx.submit();
  }
  async redeemAsset({ txHash, key, outputIndex }: { txHash: string; key: string; outputIndex: number }) {
    const {
      address: scriptAddress,
      script,
      type,
    } = this.getClaimLinkScript({
      outputIndex,
      txHash,
    });

    const allUtxos = await this.lucid.utxosAt(scriptAddress as Address);
    const redeemLucid = await Lucid.new(new Blockfrost(this.blockFrostUrl, this.blockfrostId), this.network);
    redeemLucid.selectWalletFromPrivateKey(key);
    const redeemAddress = await redeemLucid.wallet.address();
    const utxos = allUtxos.filter(utxo => {
      if (utxo.datum) {
        let datum = Data.from<ClaimLinkDatumType>(utxo.datum, ClaimLinkDatum);

        return true;
      }
      return false;
    });

    if (!utxos.length) throw new Error(`redeem script is empty`);
    const redeemerPubkey = this.lucid.utils.getAddressDetails(redeemAddress).paymentCredential?.hash;
    const myAddress = await this.lucid.wallet.address();
    const tx = this.lucid
      .newTx()
      .collectFrom(utxos, Data.void())
      .attachSpendingValidator({
        script,
        type,
      })
      .addSigner(redeemAddress)
      .complete();
    const txSignedWithRedeemer = (await tx).signWithPrivateKey(key);
    const signedTx = await txSignedWithRedeemer.sign().complete();
    return signedTx;
  }

  async generateLinkValues({ amount, assetId, owner }: { owner: string; amount: number; assetId: string }) {
    const utxos = await this.lucid.wallet.getUtxos();
    const outputIndex = utxos[utxos.length - 1].outputIndex;
    const txHash = utxos[utxos.length - 1].txHash;
    const { address: scriptAddress } = this.getClaimLinkScript({
      outputIndex,
      txHash,
    });

    const redeemerWallet = await this.createWalletAndKeyPair();

    console.log({ scriptAddress });

    const ownerPubkey = this.lucid.utils.getAddressDetails(owner).paymentCredential?.hash;
    const redeemerPubkey = this.lucid.utils.getAddressDetails(redeemerWallet.address).paymentCredential?.hash;

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

    const tx = await this.lucid
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
    const hash = await signedTx.submit();

    const success = await this.lucid.awaitTx(hash);

    if (!success) {
      throw new Error("Transaction failed");
    }

    return {
      k: redeemerWallet.key,
      oi: outputIndex,
      oh: txHash,
    };
  }
}
