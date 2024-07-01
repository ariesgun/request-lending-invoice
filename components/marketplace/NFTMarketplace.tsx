import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import InvoiceCard from "./InvoiceCard";
import { Request } from "@requestnetwork/request-client.js";
import { useEffect, useState } from "react";
import { useAppContext } from "@/utils/context";
import NFTCard from "./NFTCard";
import NFTGrid from "./NFTGrid";
import { useConnectWallet } from "@web3-onboard/react";

interface NFTMarketplaceProps {
  invoices: readonly InvoiceNFTType[];
}

const NFTMarketplace = ({ invoices }: NFTMarketplaceProps) => {
  const { requestNetwork } = useAppContext();
  const [myNfts, setMyNfts] = useState<readonly InvoiceNFTType[]>([]);
  const [listedNfts, setListedNfts] = useState<readonly InvoiceNFTType[]>([]);

  const [activeTab, setActiveTab] = useState("profile");

  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    let otherNfts: readonly InvoiceNFTType[] = invoices.filter(
      (invoice) => invoice.owner.toLowerCase() !== wallet?.accounts[0].address
    );

    let myNfts: readonly InvoiceNFTType[] = invoices.filter(
      (invoice) => invoice.owner.toLowerCase() === wallet?.accounts[0].address
    );

    setListedNfts(otherNfts);
    setMyNfts(myNfts);
  }, [invoices]);

  const onProfileTab = () => {
    setActiveTab("profile");
  };
  const onDashboardTab = () => {
    setActiveTab("dashboard");
  };

  return (
    <>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul
          className="flex flex-wrap -mb-px text-sm font-medium text-center"
          id="default-tab"
          data-tabs-toggle="#default-tab-content"
          role="tablist"
        >
          <li className="me-2" role="presentation">
            <button
              className={
                "text-md inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" +
                (activeTab === "profile" ? "text-green-800 font-bold" : "")
              }
              id="profile-tab"
              type="button"
              onClick={onProfileTab}
            >
              Marketplace
            </button>
          </li>
          <li className="me-2" role="presentation">
            <button
              className={
                "text-md inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" +
                (activeTab === "dashboard" ? "text-green-800 font-bold" : "")
              }
              id="dashboard-tab"
              type="button"
              onClick={onDashboardTab}
            >
              My Listed NFTs
            </button>
          </li>
        </ul>
      </div>
      <div id="default-tab-content" className="mt-8">
        {activeTab === "profile" && (
          <NFTGrid invoices={listedNfts} nftOwner={false} />
        )}
        {activeTab === "dashboard" && (
          <NFTGrid invoices={myNfts} nftOwner={true} />
        )}
      </div>
    </>
  );
};

export default NFTMarketplace;
