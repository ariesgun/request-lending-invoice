import("@ariesgun/invoice-dashboard");
import Head from "next/head";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { InvoiceDashboardProps } from "@/types";
import { useConnectWallet } from "@web3-onboard/react";
import { Types } from "@requestnetwork/request-client.js";
import InvoiceGrid from "@/components/marketplace/InvoiceGrid";
import InvoiceModal from "@/components/marketplace/InvoiceModal";

export default function Dashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const dashboardRef = useRef<InvoiceDashboardProps>(null);

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

    if (wallet) {
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address as string,
        })
        .then((requestData) => {
          const filteredNFTRequests = requestData?.filter(
            (request) =>
              request.getData().extensionsData[0].id ===
                "pn-erc20-transferable-receivable" &&
              request.getData().currencyInfo.network === network
          );
          setRequests(filteredNFTRequests);
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
            Invoices ERC20TransferableReceivable
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
            <option value="matic">Polygon Matic</option>
            <option value="mainnet">Etherum</option>
          </select>
        </div>
        <InvoiceGrid requests={requests} />
      </div>
    </>
  );
}
