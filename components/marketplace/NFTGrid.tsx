import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import InvoiceCard from "./InvoiceCard";
import { Request } from "@requestnetwork/request-client.js";
import { useEffect, useState } from "react";
import { useAppContext } from "@/utils/context";
import NFTCard from "./NFTCard";

interface NFTGRidProps {
  invoices: readonly InvoiceNFTType[];
}

const NFTGrid = ({ invoices }: NFTGRidProps) => {
  const { requestNetwork } = useAppContext();
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequest = async (invoices: readonly InvoiceNFTType[]) => {
      let newRequests: Request[] = [];
      for (let i = 0; i < invoices.length; i++) {
        let req = await requestNetwork?.fromRequestId(invoices[i].requestId);
        newRequests.push(req!);
      }

      setRequests(newRequests);
    };

    fetchRequest(invoices);
  }, [invoices]);

  return (
    <div className="grid grid-cols-3 gap-8">
      {requests.length > 0 &&
        requests.map((request, idx) => <NFTCard key={idx} request={request} />)}
    </div>
  );
};

export default NFTGrid;
