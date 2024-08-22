import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Else, If, Then } from "react-if";
import ConnectWallet from "@/components/common/connect-wallet";
import { useState } from "react";
import { depositAsset } from "@/lib/claim-link/deposit";
import { createWalletAndKeyPair } from "@/lib/offchain";
import { toast } from "sonner";
import { useCardano } from "@/components/providers/CardanoProvider";
function CreateCardTitle() {
  return <CardTitle>Create Claimable Linik</CardTitle>;
}
function CreateLinkForm() {
  const [adaAmount, setAdaAmount] = useState<number>();
  const { provider } = useCardano();
  const createLink = async () => {
    if (!adaAmount) {
      toast.error("Please enter ada amount");
      return;
    }
    if (!provider) {
      toast.error("Please connect wallet");
      return;
    }
    const owner = await provider.wallet.address();
    console.log({ owner });
    const newWallet = await createWalletAndKeyPair(
      "preprodTxgDKh9LgIkr2FCy3PnH1qYWC00sIjiR",
      "Preprod",
    );
    console.log({ newWallet });
    // const redeemerAddress = newWallet.getUsedAddress().toBech32();
    const a = await depositAsset({
      amount: adaAmount * 1_000_000,
      owner: owner,
      redeemer: newWallet.address,
      lucid: provider,
    });

    console.log({ a });
  };
  return (
    <>
      <CardHeader>
        <CreateCardTitle />
        <CardDescription>Enter token details</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Ada Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter How much ada to put in link"
                value={adaAmount}
                onChange={(e) =>
                  setAdaAmount(parseFloat(e.target.value.toString()))
                }
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={createLink}>Create Link</Button>
      </CardFooter>
    </>
  );
}

export default function Create() {
  const { isConnected } = useCardano();
  return (
    <main className="w-screen min-h-screen flex items-center justify-center z-50">
      <Card className="w-[350px]">
        <If condition={isConnected}>
          <Then>
            <CreateLinkForm />
          </Then>
          <Else>
            <CardHeader>
              <CreateCardTitle />
              <CardDescription>Connect Wallet to create links</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <ConnectWallet />
            </CardFooter>
          </Else>
        </If>
      </Card>
    </main>
  );
}
