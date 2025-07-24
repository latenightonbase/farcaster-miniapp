"use client"

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sei,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from 'react';


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '5d10af3027c340310f3a3da64cbcedac',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();


const Rainbow = ({ children }:{children:ReactNode}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Rainbow;