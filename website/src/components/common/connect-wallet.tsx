import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Else, If, Then } from "react-if";

import ShowWallet from "./show-wallet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { useCardano } from "../providers/CardanoProvider";
export default function ConnectWallet() {
  const { isConnected, isConnectLoading, connect, disconnect, wallets } =
    useCardano();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <If condition={isConnected}>
            <Then>
              <ShowWallet />
            </Then>
            <Else>
              <Button loading={isConnectLoading}>Connect Wallet</Button>
            </Else>
          </If>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <If condition={isConnected}>
            <Then>
              <DropdownMenuLabel>Connected</DropdownMenuLabel>
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
