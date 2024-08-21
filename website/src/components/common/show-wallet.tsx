import { shortenAddress } from "@/lib/utils";
import { useWallet } from "@meshsdk/react";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "../ui/button";
import { QueryBoundaries } from "./query-boundaries";

export function ShowWallet() {
  const { wallet, connected } = useWallet();

  const { data: address } = useQuery({
    queryKey: ["wallet-address"],
    enabled: connected,
    queryFn: async () => {
      if (wallet) {
        return (await wallet.getUsedAddress()).toBech32();
      }
    },
  });

  return (
    <QueryBoundaries>
      <Suspense fallback={<Button loading={true}>Loading</Button>}>
        <Button>{shortenAddress(address ?? "")}</Button>
      </Suspense>
    </QueryBoundaries>
  );
}
