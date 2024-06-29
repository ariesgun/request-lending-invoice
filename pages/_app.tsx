import "@/styles/globals.css";
import { Montserrat } from "next/font/google";
import type { AppProps } from "next/app";
import { Navbar } from "../components";
import { Provider } from "@/utils/context";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import { onboardConfig } from "../utils/connectWallet";
import { WagmiProvider } from "wagmi";
import { config } from "@/utils/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const montserrat = Montserrat({ subsets: ["latin"] });

const wen3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  ...onboardConfig,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${montserrat.className}`}>
      <Web3OnboardProvider web3Onboard={wen3Onboard}>
        <Provider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <Navbar />
              <Component {...pageProps} />
            </QueryClientProvider>
          </WagmiProvider>
        </Provider>
      </Web3OnboardProvider>
    </div>
  );
}
