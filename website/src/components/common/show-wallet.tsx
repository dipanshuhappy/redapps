import { shortenAddress } from "@/lib/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useCardano } from "../providers/CardanoProvider";
import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";
import { QueryBoundaries } from "./query-boundaries";

export default function ShowWallet() {
  const { provider } = useCardano();

  const { data: address } = useQuery({
    queryKey: ["wallet-address"],
    enabled: !!provider,
    queryFn: async () => {
      if (provider) {
        return await provider.wallet.address();
      }
    },
  });

  return (
    <QueryBoundaries>
      <Suspense fallback={<LoaderCircle />}>
        <Button>{shortenAddress(address ?? "")}</Button>
      </Suspense>
    </QueryBoundaries>
  );
}
