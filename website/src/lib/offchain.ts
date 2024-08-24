import blueprint from "../../../validators/plutus.json" assert { type: "json" };
import {
  // applyParamsToScript,
  OutRef,
  Constr,
  Lucid,
  Data,
  Network,
  Blockfrost,
  Address,
  Assets,
} from "lucid-cardano";
import { BlockfrostProvider, FungibleAssetMetadata } from "@meshsdk/core";
import { builtinByteString, txOutRef } from "@meshsdk/common";
type ScriptType = "PlutusV2";
import { applyParamsToScript } from "@meshsdk/core-csl";

interface Script {
  type: ScriptType;
  script: string;
  address: string;
}

export async function createWalletAndKeyPair(
  providerId: string,
  network: Network,
) {
  const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", providerId),
    network,
  );
  const key = lucid.utils.generatePrivateKey();
  lucid.selectWalletFromPrivateKey(key);
  const address = await lucid.wallet.address();
  return {
    key,
    address,
  };
}

export function getClaimLinkScript(outputRef: OutRef, lucid: Lucid) {
  // const outputRefCbor = new Constr(0, [
  //   outputRef.txHash,
  //   BigInt(outputRef.outputIndex),
  // ]);
  // console.log({ outputRefCbor });
  const codeCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    [txOutRef(outputRef.txHash, outputRef.outputIndex)],
    "JSON",
  );

  console.log({ codeCbor });

  const script: Script = {
    type: "PlutusV2",
    script: codeCbor,
    address: lucid.utils.validatorToAddress({
      script: codeCbor,
      type: "PlutusV2",
    }),
  };

  return script;
}

export const ClaimLinkDatum = Data.Object({
  owner: Data.String,
  redeemer: Data.String,
});
export type ClaimLinkDatumType = Data.Static<typeof ClaimLinkDatum>;

export async function getAssetsFromAddress(address: Address, lucid: Lucid) {
  const utxos = await lucid.utxosAt(address);

  console.log({ utxos });
  const assets = new Map<string, bigint>();
  utxos.forEach((utxo) => {
    for (const [assetId, value] of Object.entries(utxo.assets)) {
      if (!assets.has(assetId)) {
        assets.set(assetId, BigInt(0));
      }
      if (!assets.get(assetId)) {
        assets.set(assetId, BigInt(0));
      }
      assets.set(assetId, (assets.get(assetId) ?? BigInt(0)) + BigInt(value));
    }
  });

  return assets as any as Assets;
}

export async function getAssetMetadata(
  assetId: string,
  lucid: Lucid,
  providerId: string,
) {
  const blockchainProvider = new BlockfrostProvider(providerId);

  const metadata: FungibleAssetMetadata =
    await blockchainProvider.fetchAssetMetadata(assetId);

  return metadata;
}
