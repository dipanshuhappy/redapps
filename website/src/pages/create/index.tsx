import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Else, If, Switch, Then, Case } from "react-if";
import ConnectWallet from "@/components/common/connect-wallet";
import { useEffect, useState } from "react";
import { depositAsset } from "@/lib/claim-link/deposit";
import {
  createWalletAndKeyPair,
  getAssetsFromAddress,
  getAssetMetadata,
} from "@/lib/offchain";
import { toast } from "sonner";
import { useCardano } from "@/components/providers/CardanoProvider";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { shortenUrl } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import QrCode from "react-qr-code";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
type Stage = "connect" | "create" | "view";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
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
  const [amount, setAmount] = useState<number>();
  const { provider } = useCardano();
  const [assetId, setAssetId] = useState<string>("lovelace");

  const createLink = async () => {
    if (!amount) {
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
      amount: assetId === "lovelace" ? amount * 1_000_000 : amount,
      owner: owner,
      redeemer: newWallet.address,
      lucid: provider,
      assetId: assetId,
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
    const url = new URL("http://localhost:3000/redeem");
    url.searchParams.append("k", newWallet.key);
    url.searchParams.append("oi", txSigned.outputIndex.toString());
    url.searchParams.append("oh", txSigned.txHash);
    setUrl(url.toString());
    console.log({ url });
    console.log({ hash });
  };

  const { data: tokens } = useQuery({
    initialData: [{ assetId: "lovelace", title: "Ada" }],
    queryKey: ["assets"],
    queryFn: async () => {
      if (!provider) return [];
      const address = await provider.wallet.address();
      const assets = await getAssetsFromAddress(address, provider);

      console.log({ assets });

      console.log("arrayyy", (assets as any).keys()?.toArray());
      const assetIdAndName: { assetId: string; title: string }[] = [
        { assetId: "lovelace", title: "Ada" },
      ];
      for (const assetId of (assets as any).keys().toArray()) {
        if (assetId !== "lovelace") {
          const metadata = await getAssetMetadata(
            assetId,
            provider,
            "preprodTxgDKh9LgIkr2FCy3PnH1qYWC00sIjiR",
          );
          console.log("asset", assetId);
          console.log({ metadata });
          assetIdAndName.push({
            assetId,
            title: metadata?.name ?? "Unknown",
          });
        }
      }

      return assetIdAndName;
    },
  });

  console.log({ tokens });

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
              <Select
                onValueChange={(value) => setAssetId(value)}
                value={assetId}
              >
                <SelectTrigger className="w-[180px]  mx-auto my-6">
                  <SelectValue placeholder="Select a Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Token</SelectLabel>
                    {tokens.map((token) => (
                      <SelectItem value={token.assetId}>
                        {token.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label htmlFor="name">Token Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter How much ada to put in link"
                value={amount}
                onChange={(e) =>
                  setAmount(parseFloat(e.target.value.toString()))
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

  useEffect(() => {
    if (url !== "") {
      setStage("view");
    }
  }, [url]);
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
