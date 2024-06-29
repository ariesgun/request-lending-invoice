import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import InvoiceCard from "./InvoiceCard";
import { Request } from "@requestnetwork/request-client.js";

interface InvoiceGridProps {
  requests: Request[];
}

const InvoiceGrid = ({ requests }: InvoiceGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-8">
      {requests.length > 0 &&
        requests.map((request, idx) => (
          <div>
            <InvoiceCard key={idx} request={request} />
          </div>
        ))}
    </div>
  );
};

export default InvoiceGrid;
