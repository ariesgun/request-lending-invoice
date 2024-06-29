import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  http,
  parseAbi,
} from "viem";
import { mainnet, polygon, sepolia } from "viem/chains";
import { BigNumber } from "ethers";
import moment from "moment";
import InvoiceModal from "./InvoiceModal";
import { Request } from "@requestnetwork/request-client.js";
import { polygonAssets, sepoliaAssets } from "@/utils/currency";
import { parsePaymentNetwork } from "@/utils/requestUtil";

interface InvoiceProps {
  request: Request;
}

const InvoiceCard = ({ request }: InvoiceProps) => {
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimal] = useState(1);

  const requestData: IRequestDataWithEvents = request.getData();

  useEffect(() => {
    let chain;
    let assets;
    if (requestData?.currencyInfo?.network === "matic") {
      chain = polygon;
      assets = polygonAssets;
    } else if (requestData?.currencyInfo?.network === "sepolia") {
      chain = sepolia;
      assets = sepoliaAssets;
    } else {
      chain = mainnet;
      assets = sepoliaAssets;
    }

    setDecimal(assets[requestData?.currencyInfo?.value].decimals);
    setSymbol(assets[requestData?.currencyInfo?.value].symbol);

    // const publicClient = createPublicClient({
    //   chain: chain,
    //   transport: http(),
    // });

    // publicClient
    //   .readContract({
    //     address: requestData?.currencyInfo?.value,
    //     abi: erc20Abi,
    //     functionName: "decimals",
    //   })
    //   .then((data) => {
    //     setDecimal(data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    // publicClient
    //   .readContract({
    //     address: requestData?.currencyInfo?.value,
    //     abi: erc20Abi,
    //     functionName: "symbol",
    //   })
    //   .then((data) => {
    //     setSymbol(data);
    //     console.log(data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    console.log(requestData);
  }, [requestData]);

  return (
    <div className="max-w-full rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-lg mb-2">
          Invoice #{requestData?.contentData?.invoiceNumber}
        </div>
        <div className="pt-2">
          Status{":  "}
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ml-2">
            {requestData?.state}
          </span>
        </div>
        <div className="pt-2">
          Due Date{":  "}
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ml-2">
            {moment(
              new Date(requestData?.contentData?.paymentTerms.dueDate)
            ).format("Do MMM YYYY")}
          </span>
        </div>
        <div className="mt-4">
          <div className="font-medium text-base text-gray-900">Payer</div>
          <p className="text-gray-700 text-base">{requestData?.payer?.value}</p>
          <div className="bg-gray-200 px-4 py-2 mt-2">
            {requestData?.contentData?.buyerInfo?.firstName ? (
              <>
                <p className="text-gray-700 text-base">
                  {requestData?.contentData?.buyerInfo?.firstName}{" "}
                  {requestData?.contentData?.buyerInfo?.lastName}
                  {" ("}
                  {requestData?.contentData?.sellerInfo?.email}
                  {") "}
                </p>
                <p className="text-gray-700 text-base">
                  {" "}
                  {requestData?.contentData?.buyerInfo?.businessName}
                </p>
                <p className="text-gray-700 text-base">
                  {" "}
                  {requestData?.contentData?.sellerInfo?.address?.locality}
                  {", "}
                  {
                    requestData?.contentData?.sellerInfo?.address?.[
                      "country-name"
                    ]
                  }
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 text-base">No buyer information</p>
              </>
            )}
          </div>

          <div className="mt-2 mb-2">
            <div className="font-medium text-base text-gray-900">Owner</div>
            <p className="text-gray-700 text-base">
              {requestData?.payee?.value}
            </p>
            <div className="bg-gray-200 px-4 py-2 mt-2">
              {requestData?.contentData?.buyerInfo?.firstName ? (
                <>
                  <p className="text-gray-700 text-base">
                    {requestData?.contentData?.sellerInfo?.firstName}{" "}
                    {requestData?.contentData?.sellerInfo?.lastName}
                    {" ("}
                    {requestData?.contentData?.sellerInfo?.email}
                    {") "}
                  </p>
                  <p className="text-gray-700 text-base">
                    {" "}
                    {requestData?.contentData?.sellerInfo?.businessName}
                  </p>
                  <p className="text-gray-700 text-base">
                    {" "}
                    {requestData?.contentData?.sellerInfo?.address?.locality}
                    {", "}
                    {
                      requestData?.contentData?.sellerInfo?.address?.[
                        "country-name"
                      ]
                    }
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 text-base">
                    No seller information
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t-2">
          <div className="font-medium text-base text-gray-900">Invoice</div>
          <p className="text-gray-700 text-base">
            Amount: {formatUnits(BigInt(requestData?.expectedAmount), decimal)}{" "}
            {symbol}
          </p>
          <p className="text-gray-700 text-base">
            Chain: {requestData?.currencyInfo?.network}
          </p>
          <p className="text-gray-700 text-base">
            Type: {parsePaymentNetwork(requestData?.extensionsData[0].id)}
          </p>
        </div>
        <div className="flex flex-row items-center pb-4 gap-4">
          <div className="mt-4 md:mt-6">
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700"
            >
              Finance Invoice
            </a>
          </div>
          <div className="mt-4 md:mt-6">
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green dark:hover:bg-green-700 dark:focus:ring-green-700">
              Detail
            </button>
          </div>
          <div className="mt-4 md:mt-6">
            <InvoiceModal request={request} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
