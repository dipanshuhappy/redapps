import { useState } from "react";
import type { NextPage } from "next";
import { useWallet, useWalletList } from "@meshsdk/react";
import { CardanoWallet } from "@meshsdk/react";
import ConnectWallet from "@/components/common/connect-wallet";
export default function Home() {
  const { connected, wallet, connect, connecting } = useWallet();
  const wallets = useWalletList();
  console.log({ wallets });
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <main>
      <ConnectWallet />
    </main>
  );
}
