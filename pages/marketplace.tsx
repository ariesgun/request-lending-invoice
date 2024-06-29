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

export default function InvoiceMarketplace() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const dashboardRef = useRef<InvoiceDashboardProps>(null);

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.config = config;

      if (wallet && requestNetwork) {
        dashboardRef.current.wallet = wallet;
        dashboardRef.current.requestNetwork = requestNetwork;
      }
    }

    if (wallet) {
      console.log("Hey", wallet?.accounts[0].address);
      requestNetwork
        ?.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: wallet?.accounts[0].address as string,
        })
        .then((requestData) => {
          const filteredNFTRequests = requestData?.filter(
            (request) =>
              request.getData().extensionsData[0].id ===
              "pn-erc20-transferable-receivable"
          );

          console.log(filteredNFTRequests);

          setRequests(filteredNFTRequests);
        });
    }
  }, [wallet, requestNetwork]);

  return (
    <>
      <Head>
        <title>Invoice Financing</title>
      </Head>
      <div className="container m-auto w-[100%]">
        <InvoiceGrid requests={requests} />
      </div>
    </>
  );
}
