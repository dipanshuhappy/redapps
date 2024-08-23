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
import { Else, If, Switch, Then, Case } from "react-if";
import ConnectWallet from "@/components/common/connect-wallet";
import { useEffect, useState } from "react";
import { depositAsset } from "@/lib/claim-link/deposit";
import { createWalletAndKeyPair } from "@/lib/offchain";
import { toast } from "sonner";
import { useCardano } from "@/components/providers/CardanoProvider";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { shortenUrl } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import QrCode from "react-qr-code";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
type Stage = "connect" | "create" | "view";
function CreateCardTitle() {
  return <CardTitle>Create Claimable Linik</CardTitle>;
}

function ViewLink({
  url,
  setStage,
}: {
  url: string;
  setStage: React.Dispatch<React.SetStateAction<Stage>>;
}) {
  const message = encodeURIComponent("Click on this link to claim crypto");
  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${message} ${url}`, "_blank");
  };

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${url}&text=${message}`, "_blank");
  };

  const handleSendClick = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (emailRegex.test(inputValue)) {
      // Redirect to mail client with subject and body in a new tab
      window.open(
        `mailto:${inputValue}?subject=Hello&body=${message}`,
        "_blank",
      );
    } else if (phoneRegex.test(inputValue)) {
      // Redirect to SMS client with body message in a new tab
      window.open(`sms:${inputValue}?body=${message}`, "_blank");
    } else {
      toast.error("Please enter a valid email or phone number");
    }
  };

  const [inputValue, setInputValue] = useState("");
  return (
    <>
      <CardHeader>
        <CreateCardTitle />
        <CardDescription>Share Link</CardDescription>
      </CardHeader>
      <CardContent>
        <QrCode value={url} className="mx-auto" />

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter email or phone number"
            className="flex-grow"
          />
          <Button onClick={handleSendClick} className="ml-2">
            Send
          </Button>
        </div>
        <span className="my-8 flex justify-center flex-col">
          <Badge>{shortenUrl(url ?? "", 40)}</Badge>
          <CopyButton text={url} />
        </span>

        <div className="flex mt-6 justify-center space-x-4">
          <Button
            onClick={shareOnWhatsApp}
            className="flex items-center space-x-2"
          >
            <FaWhatsapp />
          </Button>
          <Button
            onClick={shareOnTelegram}
            className="flex items-center space-x-2"
          >
            <FaTelegramPlane />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => setStage("create")}>Create another link</Button>
      </CardFooter>
    </>
  );
}
function CreateLinkForm({
  url,
  setUrl,
}: {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
}) {
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
    const txSigned = await depositAsset({
      amount: adaAmount * 1_000_000,
      owner: owner,
      redeemer: newWallet.address,
      lucid: provider,
    });

    const hash = await txSigned.signedTx.submit();
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
    const url = new URL("http://localhost:3000");
    url.searchParams.append("s", txSigned.scriptAddress);
    url.searchParams.append("k", newWallet.key);
    url.searchParams.append("t", hash);
    setUrl(url.toString());
    console.log({ url });
    console.log({ hash });
  };

  return (
    <>
      <CardHeader>
        <CreateCardTitle />
        <CardDescription>Enter token details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="my-9">
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

function CreateLink() {
  const { isConnected } = useCardano();
  const [stage, setStage] = useState<Stage>(isConnected ? "create" : "connect");
  useEffect(() => {
    if (isConnected) {
      setStage("create");
    }
  }, [isConnected]);

  useEffect(() => {
    if (stage == "create") {
      setUrl("");
    }
  }, [stage]);

  const [url, setUrl] = useState<string>("");

  return (
    <>
      <Card className="w-[350px]">
        <Switch>
          <Case condition={stage === "connect"}>
            <>
              <CardHeader>
                <CreateCardTitle />
                <CardDescription>
                  Connect Wallet to create links
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <ConnectWallet />
              </CardFooter>
            </>
          </Case>
          <Case condition={stage === "create"}>
            <CreateLinkForm setUrl={setUrl} url={url} />
          </Case>
          <Case condition={stage === "view"}>
            <ViewLink url={url} setStage={setStage} />
          </Case>
        </Switch>
      </Card>
    </>
  );
}
export default function Create() {
  return (
    <main className="w-screen min-h-screen flex items-center justify-center z-50">
      <CreateLink />
    </main>
  );
}
