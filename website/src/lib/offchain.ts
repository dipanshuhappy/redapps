import blueprint from "../../../validators/plutus.json" assert { type: "json" };
import {
  BlockfrostProvider,
  MeshTxBuilder,
  serializePlutusScript,
  OutputReference,
  ConStr,
  UTxO,
  txOutRef,
  MeshWallet,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
type ScriptType = "PlutusV2";

interface Script {
  type: ScriptType;
  script: string;
  address: string;
}
export function getClaimLinkScript(outputRef: UTxO["input"]) {
  const codeCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    [txOutRef(outputRef.txHash, outputRef.outputIndex)],
    "JSON",
  );

  const script: Script = {
    type: "PlutusV2",
    script: codeCbor,
    address: serializePlutusScript({
      code: codeCbor,
      version: "V2",
    }).address,
  };

  return script;
}

export const blockchainProvider = new BlockfrostProvider(
  "preprodTxgDKh9LgIkr2FCy3PnH1qYWC00sIjiR",
);

export const getTxBuilder = () => {
  return new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
  });
};

export const generateWalletAddress = () => {
  const privatekey = MeshWallet.brew(true);
  const wallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
      type: "root",
      bech32: privatekey as string,
    },
  });

  return wallet;
};
export async function getUtxoOfAddress(address: string) {
  return await blockchainProvider.fetchAddressUTxOs(address);
}
