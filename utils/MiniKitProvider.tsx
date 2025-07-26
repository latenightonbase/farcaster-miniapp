"use client";

import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import Rainbow from "./rainbow";

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
    projectId="37951d20-538e-48fb-9248-0f5481ebf0ee"
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      chain={base}
      notificationProxyUrl="/api/notification"
    >
      <Rainbow>{children}</Rainbow>
    </MiniKitProvider>
  );
}
