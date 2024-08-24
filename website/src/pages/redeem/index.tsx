import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useCardano } from "@/components/providers/CardanoProvider";
import { If, Then, Else } from "react-if";
import ConnectWallet from "@/components/common/connect-wallet";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { redeemAsset } from "@/lib/claim-link/redeem";
export default function Redeem() {
  const { isConnected, provider } = useCardano();
  const { query } = useRouter();
  const { oi, oh, key } = useMemo(
    () => ({
      oi: query.oi as string,
      oh: query.oh as string,
      key: query.k as string,
    }),
    [query],
  );

  const onClaim = async () => {
    if (!oi || !oh || !key) {
      toast.error("Invalid claim link");
      throw new Error("Invalid claim link");
    }
    if (!provider) {
      toast.error("Connect wallet first");
      throw new Error("Connect wallet first");
    }
    const s = await redeemAsset({
      txHash: oh,
      providerId: "preprodTxgDKh9LgIkr2FCy3PnH1qYWC00sIjiR",
      lucid: provider,
      key: key,
      outputIndex: parseInt(oi),
    });
    console.log(s);

    const hash = await s.signedTx.submit();
    const loadingToast = toast.loading(
      "Waiting for transaction to be confirmed",
    );

    const success = await provider.awaitTx(hash);
    toast.dismiss(loadingToast);

    if (success) {
      toast.success("Transaction confirmed");
    } else {
      toast.error("Transaction failed");
    }
  };

  console.log({ oi, key, oh });

  return (
    <main className="w-screen min-h-screen flex items-center justify-center z-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Claim Link</CardTitle>
          <CardDescription>
            {isConnected ? "Click" : "Connect Wallet"} to claim token
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CardFooter className="flex justify-center">
            <If condition={isConnected}>
              <Then>
                <Button onClick={onClaim}>Claim</Button>
              </Then>
              <Else>
                <ConnectWallet />
              </Else>
            </If>
          </CardFooter>
        </CardContent>
      </Card>
    </main>
  );
}
