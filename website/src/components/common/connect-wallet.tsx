import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useWallet, useWalletList, useWalletSubmit } from "@meshsdk/react";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import { Else, If, Then } from "react-if";
import { shortenAddress } from "@/lib/utils";
import { QueryBoundaries } from "./query-boundaries";
import { useQuery } from "@tanstack/react-query";
import ShowWallet from "./show-wallet";

export default function ConnectWallet() {
  const wallets = useWalletList();
  const { connect, connected, connecting, disconnect, name, wallet } =
    useWallet();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <If condition={connected}>
            <Then>
              <ShowWallet />
            </Then>
            <Else>
              <Button loading={connecting}>Connect Wallet</Button>
            </Else>
          </If>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <If condition={connected}>
            <Then>
              <DropdownMenuLabel>{name} Connected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnect}>
                Disconnect
              </DropdownMenuItem>
            </Then>
            <Else>
              <DropdownMenuLabel>Wallets Available</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {wallets.map((wallet) => (
                <DropdownMenuItem
                  key={wallet.name}
                  onClick={() =>
                    connect(wallet.name).catch((err) => {
                      toast.error(err.message);
                    })
                  }
                >
                  {wallet.name}
                </DropdownMenuItem>
              ))}
            </Else>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
