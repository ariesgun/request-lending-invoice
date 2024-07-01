import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import moment from "moment";
import { useEffect, useState } from "react";
import { DoneIcon, HourGlassIcon } from "../icons";
import { STATE } from "@requestnetwork/types/dist/request-logic-types";

interface InvoiceInfoProps {
  request: IRequestDataWithEvents;
  isMinted: boolean;
  isAccepted: boolean;
  isPaid: boolean;
  isLoading: boolean;
}

const InvoiceInfo = ({
  request,
  isMinted,
  isAccepted,
  isPaid,
  isLoading,
}: InvoiceInfoProps) => {
  return (
    <div className="ml-10">
      <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 ">
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
      {isLoading && (
        <div
          role="status"
          className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
        >
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default InvoiceInfo;
