import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  getContract,
  http,
  parseAbi,
  parseEther,
} from "viem";
import { mainnet, polygon, sepolia } from "viem/chains";
import { BigNumber } from "ethers";
import moment from "moment";
import InvoiceModal from "./InvoiceModal";
import { Request } from "@requestnetwork/request-client.js";
import { polygonAssets, sepoliaAssets } from "@/utils/currency";
import {
  getAssetsList,
  getChainFromRequest,
  parsePaymentNetwork,
} from "@/utils/requestUtil";
import { marketplaceABI, marketplaceAddress } from "./marketplaceABI";
import { getReceivableTokenIdForRequest } from "@requestnetwork/payment-processor";
import { useEthersSigner } from "@/utils/etherWagmi";

interface InvoiceProps {
  request: Request;
  nftInfo: InvoiceNFTType;
  nftOwner: boolean;
}

const NFTCard = ({ request, nftInfo, nftOwner }: InvoiceProps) => {
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimal] = useState(1);
  const [requestData, setRequestData] = useState(request.getData());
  const signer = useEthersSigner();

  let chain = getChainFromRequest(requestData!);

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  // eg: Metamask
  const walletClient = createWalletClient({
    chain: chain,
    transport: custom(window?.ethereum!),
  });

  useEffect(() => {
    setRequestData(request.getData());
    let assets = getAssetsList(requestData);

    setDecimal(assets[requestData?.currencyInfo?.value].decimals);
    setSymbol(assets[requestData?.currencyInfo?.value].symbol);

    console.log("Card", requestData);
  }, [request]);

  const onListNFT = async () => {
    const requestId = requestData?.requestId;

    await walletClient.switchChain({ id: chain.id });

    const [account] = await walletClient.getAddresses();
    const tokenId = await getReceivableTokenIdForRequest(requestData!, signer!);

    const contract = getContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const result = await contract.simulate.listInvoice(
      [BigInt(tokenId._hex), requestId],
      {
        account,
      }
    );
    console.log("Result", result);
    const mintTx = await contract.write.listInvoice(
      [BigInt(tokenId._hex), requestId],
      {
        account,
      }
    );
  };

  const onUnlistNFT = async () => {
    const requestId = requestData?.requestId;

    await walletClient.switchChain({ id: chain.id });

    const [account] = await walletClient.getAddresses();
    const tokenId = await getReceivableTokenIdForRequest(requestData!, signer!);

    const contract = getContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const result = await contract.simulate.unlistInvoice(
      [BigInt(tokenId._hex)],
      {
        account,
      }
    );
    console.log("Result", result);
    const mintTx = await contract.write.unlistInvoice([BigInt(tokenId._hex)], {
      account,
    });
  };

  const onBuyNFT = async () => {
    await walletClient.switchChain({ id: chain.id });

    const contract = getContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    // USDC
    const tokenAddress = requestData?.currencyInfo.value;
    const tokenContract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const [account] = await walletClient.getAddresses();

    console.log(BigInt(requestData!.expectedAmount));

    const approveRes = await tokenContract.simulate.approve(
      [contract.address, BigInt(requestData!.expectedAmount)],
      { account }
    );
    const approveTx = await tokenContract.write.approve(
      [contract.address, BigInt(requestData!.expectedAmount)],
      { account }
    );
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    const tokenId = await getReceivableTokenIdForRequest(requestData!, signer!);
    console.log("TokenId", tokenId);

    const result = await contract.simulate.buyInvoice([BigInt(tokenId._hex)], {
      account,
    });
    console.log("Result", result);
    const mintTx = await contract.write.buyInvoice([BigInt(tokenId._hex)], {
      account,
    });
  };

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
                </p>
                {requestData?.contentData?.sellerInfo?.email && (
                  <p className="text-gray-700 text-base">
                    {requestData?.contentData?.sellerInfo?.email}
                  </p>
                )}
                <p className="text-gray-700 text-base">
                  {requestData?.contentData?.buyerInfo?.businessName}
                </p>
                {requestData?.contentData?.sellerInfo?.address && (
                  <p className="text-gray-700 text-base">
                    {requestData?.contentData?.sellerInfo?.address?.locality}{" "}
                    {
                      requestData?.contentData?.sellerInfo?.address?.[
                        "country-name"
                      ]
                    }
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-700 text-base">No buyer information</p>
              </>
            )}
          </div>

          <div className="mt-2 mb-2">
            <div className="font-medium text-base text-gray-900">Payee</div>
            <p className="text-gray-700 text-base">
              {requestData?.payee?.value}
            </p>
            <div className="bg-gray-200 px-4 py-2 mt-2">
              {requestData?.contentData?.buyerInfo?.firstName ? (
                <>
                  <p className="text-gray-700 text-base">
                    {requestData?.contentData?.sellerInfo?.firstName +
                      " " +
                      requestData?.contentData?.sellerInfo?.lastName}
                  </p>
                  {requestData?.contentData?.sellerInfo?.email && (
                    <p className="text-gray-700 text-base">
                      {requestData?.contentData?.sellerInfo?.email}
                    </p>
                  )}
                  <p className="text-gray-700 text-base">
                    {" "}
                    {requestData?.contentData?.sellerInfo?.businessName}
                  </p>
                  {requestData?.contentData?.sellerInfo?.address && (
                    <p className="text-gray-700 text-base">
                      {requestData?.contentData?.sellerInfo?.address?.locality}{" "}
                      {
                        requestData?.contentData?.sellerInfo?.address?.[
                          "country-name"
                        ]
                      }
                    </p>
                  )}
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
            <InvoiceModal request={request} />
          </div>

          {nftOwner ? (
            nftInfo.isListed ? (
              <div className="mt-4 md:mt-6">
                <button
                  onClick={onUnlistNFT}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700"
                >
                  Unlist Invoice
                </button>
              </div>
            ) : (
              <div className="mt-4 md:mt-6">
                <button
                  onClick={onListNFT}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700"
                >
                  List Invoice
                </button>
              </div>
            )
          ) : (
            <div className="mt-4 md:mt-6">
              <button
                onClick={onBuyNFT}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700"
              >
                Finance Invoice (Buy NFT)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
