import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import moment from "moment";
import { useEffect, useState } from "react";
import { DoneIcon, HourGlassIcon } from "../icons";

interface InvoiceInfoProps {
  request: IRequestDataWithEvents;
  isMinted: boolean;
}

const InvoiceInfo = ({ request, isMinted }: InvoiceInfoProps) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (request) {
      if (request.state === "accepted") {
        setIsAccepted(true);

        if (request?.balance?.balance! >= request?.expectedAmount) {
          setIsPaid(true);
        }
      }
    }
  }, [request]);

  return (
    <div className="ml-10">
      <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <li className="mb-10 ms-6">
          <DoneIcon />
          <h3 className="font-medium leading-tight text-lg">Created</h3>
          <p className="text-md">
            Invoice #{request.contentData?.invoiceNumber} created on{" "}
            {moment(request.timestamp * 1000).format("DD/MMM/YYYY")}
          </p>
        </li>
        {request.extensionsData[0].id ===
          "pn-erc20-transferable-receivable" && (
          <li className="mb-10 ms-6">
            {isMinted ? (
              <>
                <DoneIcon />
                <h3 className="font-medium leading-tight text-lg">
                  NFT Minted
                </h3>
                <p className="text-md">
                  Invoice #{request.contentData?.invoiceNumber} minted as NFT.
                </p>
              </>
            ) : (
              <>
                <HourGlassIcon />
                <h3 className="font-medium leading-tight text-lg">Pending</h3>
                <p className="text-md">
                  Waiting for Invoice #{request.contentData?.invoiceNumber} to
                  be minted as NFT
                </p>
              </>
            )}
          </li>
        )}
        <li className="mb-10 ms-6">
          {isAccepted ? (
            <>
              <DoneIcon />
              <h3 className="font-medium leading-tight text-lg">Accepted</h3>
              <p className="text-md">
                Invoice #{request.contentData?.invoiceNumber} accepted by the
                payer on 23/04/2024
              </p>
            </>
          ) : (
            <>
              <HourGlassIcon />
              <h3 className="font-medium leading-tight text-lg">Pending</h3>
              <p className="text-md">
                Waiting for Invoice #{request.contentData?.invoiceNumber} to be
                accepted.
              </p>
            </>
          )}
        </li>
        <li className="ms-6">
          {isPaid ? (
            <>
              <DoneIcon />
              <h3 className="font-medium leading-tight text-lg">Paid</h3>
              <p className="text-md">
                Invoice #{request.contentData?.invoiceNumber} paid by the payer
                on 23/04/2024
              </p>
            </>
          ) : (
            <>
              <HourGlassIcon />
              <h3 className="font-medium leading-tight text-lg">Pending</h3>
              <p className="text-md">
                Waiting for Invoice #{request.contentData?.invoiceNumber} to be
                paid.
              </p>
            </>
          )}
        </li>
      </ol>
    </div>
  );
};

export default InvoiceInfo;
