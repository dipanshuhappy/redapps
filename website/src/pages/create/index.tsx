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
import { useWallet } from "@meshsdk/react";
import { Else, If, Then } from "react-if";
import ConnectWallet from "@/components/common/connect-wallet";
import { useState } from "react";
import { depositAsset } from "@/lib/claim-link/deposit";
import { generateWalletAddress } from "@/lib/offchain";
import { toast } from "sonner";
import { BrowserWallet, Transaction } from "@meshsdk/core";
function CreateCardTitle() {
  return <CardTitle>Create Claimable Linik</CardTitle>;
}
function CreateLinkForm() {
  const [adaAmount, setAdaAmount] = useState<number>();
  const { wallet } = useWallet();
  const createLink = async () => {
    if (!adaAmount) {
      toast.error("Please enter ada amount");
      return;
    }
    const owner = (await wallet.getUsedAddress()).toBech32();
    const newWallet = generateWalletAddress();
    console.log(owner);
    const redeemerAddress = newWallet.getUsedAddress().toBech32();
    // const a = await depositAsset({
    //   amount: adaAmount * 1_000_000,
    //   owner: owner,
    //   redeemer: redeemerAddress,
    // });
    const lace = await BrowserWallet.enable("lace");
    console.log({ lace });
    const tx = new Transaction({ initiator: lace });

    const hex = await tx.sendLovelace(redeemerAddress, "1").build();
    console.log({ hex });
    // console.log({ a });
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
  const { connected } = useWallet();
  return (
    <main className="w-screen min-h-screen flex items-center justify-center z-50">
      <Card className="w-[350px]">
        <If condition={connected}>
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
