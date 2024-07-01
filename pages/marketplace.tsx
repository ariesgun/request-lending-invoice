"use client";

import("@ariesgun/invoice-dashboard");
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { InvoiceDashboardProps } from "@/types";
import { useConnectWallet } from "@web3-onboard/react";
import { Types } from "@requestnetwork/request-client.js";
import InvoiceGrid from "@/components/marketplace/InvoiceGrid";
import InvoiceModal from "@/components/marketplace/InvoiceModal";
import { getChainFromRequest } from "@/utils/requestUtil";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
} from "viem";
import { marketplaceABI } from "@/components/marketplace/marketplaceABI";
import { useEthersProvider } from "@/utils/etherProvider";
import { useEthersSigner } from "@/utils/etherWagmi";
import { mainnet, polygon, sepolia } from "viem/chains";
import NFTGrid from "@/components/marketplace/NFTGrid";

export default function InvoiceMarketplace() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const dashboardRef = useRef<InvoiceDashboardProps>(null);

  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [invoices, setInvoices] = useState<readonly InvoiceNFTType[]>([]);
  const [requests, setRequests] = useState([]);

  const [network, setNetwork] = useState("sepolia");

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.config = config;

      if (wallet && requestNetwork) {
        dashboardRef.current.wallet = wallet;
        dashboardRef.current.requestNetwork = requestNetwork;
      }
    }

    const getAllListedInvoices = async () => {
      let chain;
      if (network === "matic") {
        chain = polygon;
      } else if (network === "sepolia") {
        chain = sepolia;
      } else {
        chain = mainnet;
      }

      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      // eg: Metamask
      const walletClient = createWalletClient({
        chain: chain,
        transport: custom(window?.ethereum!),
      });

      await walletClient.switchChain({ id: chain.id });

      const contract = getContract({
        address: "0xc2B3fE687175a5B6bc81452541356aEd91221be4",
        abi: marketplaceABI,
        client: {
          public: publicClient,
          wallet: walletClient,
        },
      });

      const [account] = await walletClient.getAddresses();

      const result = await contract.read.getAllListedInvoices({
        account,
      });
      return result;
    };

    if (wallet) {
      getAllListedInvoices().then((nfts) => {
        console.log("NFTS", nfts);
        setInvoices(nfts);
      });
    }
  }, [wallet, requestNetwork, network]);

  return (
    <>
      <Head>
        <title>Invoice Financing</title>
      </Head>
      <div className="container m-auto w-[100%]">
        <div className="my-6">
          <p className="text-2xl font-semibold">
            ERC20TransferableReceivable Marketplace
          </p>
        </div>
        <div className="w-[20%] mb-6">
          <p className="text-lg">Network</p>
          <select
            id="networks"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="sepolia">Sepolia</option>
            {/* <option value="matic">Polygon Matic</option>
            <option value="mainnet">Etherum</option> */}
          </select>
        </div>
        <NFTGrid invoices={invoices} />
      </div>
    </>
  );
}

// TODO:
// 1. Connect to the Marketplace smartcontract from the frontend.
// 2. List the NFT
// 3. Show all Listed NFT
// 4. Buy NFT
