import "@/styles/globals.css";
import { MeshProvider } from "@meshsdk/react";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshProvider>
        <Toaster />
        <Component {...pageProps} />
      </MeshProvider>
    </QueryClientProvider>
  );
}
