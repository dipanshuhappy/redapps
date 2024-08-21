"use client";

import { MeshProvider } from "@meshsdk/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MeshProvider>{children}</MeshProvider>
    </>
  );
}
