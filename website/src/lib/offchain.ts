import blueprint from "../../../validators/plutus.json" assert { type: "json" };
import {
  // applyParamsToScript,
  OutRef,
  Constr,
  Lucid,
  Data,
  Network,
  Blockfrost,
} from "lucid-cardano";
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
