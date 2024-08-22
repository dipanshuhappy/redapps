import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import withClientOnly from "@/components/common/client-only";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { CardanoProvider } from "@/components/providers/CardanoProvider";

const queryClient = new QueryClient({
  defaultOptions: {},
});
const app = function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CardanoProvider
        blockFrostPoviderId="preprodTxgDKh9LgIkr2FCy3PnH1qYWC00sIjiR"
        network="Preprod"
      >
        <Toaster />
        <BackgroundBeamsWithCollision>
          <Component {...pageProps} />
        </BackgroundBeamsWithCollision>
      </CardanoProvider>
    </QueryClientProvider>
  );
};
export default withClientOnly(app);
