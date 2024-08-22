import { useState } from "react";
import type { NextPage } from "next";
import ConnectWallet from "@/components/common/connect-wallet";
export default function Home() {
  return (
    <main className="z-50">
      <ConnectWallet />
    </main>
  );
}
