import("@ariesgun/invoice-dashboard");
import Head from "next/head";
import { useEffect, useRef } from "react";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { InvoiceDashboardProps } from "@/types";
import { useConnectWallet } from "@web3-onboard/react";
import Link from "next/link";

export default function InvoiceDashboard() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const dashboardRef = useRef<InvoiceDashboardProps>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.config = config;

      if (wallet && requestNetwork) {
        dashboardRef.current.wallet = wallet;
        dashboardRef.current.requestNetwork = requestNetwork;
      }
    }
  }, [wallet, requestNetwork]);

  return (
    <>
      <Head>
        <title>Request Payment</title>
      </Head>
      <div className="container m-auto  w-[100%]">
        <div className="flex flex-col items-end pb-4">
          <div className="flex mt-4 md:mt-6">
            <Link
              href="/create-invoice"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green dark:hover:bg-light-green dark:focus:ring-light-green"
            >
              Create Invoice
            </Link>
          </div>
        </div>
        <invoice-dashboard ref={dashboardRef} />
      </div>
    </>
  );
}
