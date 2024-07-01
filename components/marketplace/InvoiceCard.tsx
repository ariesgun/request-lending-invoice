import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  formatUnits,
  getContract,
  http,
  parseAbi,
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
import {
  getReceivableTokenIdForRequest,
  hasReceivableForRequest,
} from "@requestnetwork/payment-processor";
import { useEthersSigner } from "@/utils/etherWagmi";
import { erc721TransferableReceivableAddress } from "./erc721Transferable";

interface InvoiceProps {
  request: Request;
}

const InvoiceCard = ({ request }: InvoiceProps) => {
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimal] = useState(1);
  const [requestData, setRequestData] = useState(request.getData());
  const signer = useEthersSigner();

  const [isOwner, setIsOwner] = useState(false);
  const [nftOwner, setNftOwner] = useState("Not Minted");

  let chain = getChainFromRequest(requestData!);
  const requestId = requestData?.requestId;

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  // eg: Metamask
  const walletClient = createWalletClient({
    chain: chain,
    transport: custom(window?.ethereum!),
  });

  const nftContract = getContract({
    address: erc721TransferableReceivableAddress,
    abi: erc721Abi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  useEffect(() => {
    setRequestData(request?.getData());
    let assets = getAssetsList(requestData);

    setDecimal(assets[requestData?.currencyInfo?.value].decimals);
    setSymbol(assets[requestData?.currencyInfo?.value].symbol);

    const checkOwner = async () => {
      const isReceivable = await hasReceivableForRequest(
        request?.getData(),
        signer!
      );

      const [account] = await walletClient.getAddresses();

      if (isReceivable) {
        const tokenId = await getReceivableTokenIdForRequest(
          requestData!,
          signer!
        );

        if (chain === sepolia) {
          const owner = await nftContract.read.ownerOf([BigInt(tokenId._hex)]);
          setIsOwner(owner === account);
          setNftOwner(owner);
        }
      } else {
        setIsOwner(account === requestData?.payee?.value);
      }
    };

    if (signer) {
      checkOwner().catch((err) => {
        console.log("Error", err);
      });
    }
  }, [request, signer]);

  const onMintNFT = async () => {
    await walletClient.switchChain({ id: chain.id });

    const contract = getContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const tokenId = await getReceivableTokenIdForRequest(requestData!, signer!);
    console.log("TokenId", tokenId);

    const [account] = await walletClient.getAddresses();

    const approveResult = await nftContract.simulate.approve(
      [contract.address, BigInt(tokenId._hex)],
      { account }
    );
    const approveTx = await nftContract.write.approve(
      [contract.address, BigInt(tokenId._hex)],
      { account }
    );
    console.log("Tx", approveTx);

    await publicClient.waitForTransactionReceipt({
      hash: approveTx,
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
            <div className="font-medium text-base text-gray-900">Payee</div>
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
        <div className="mt-2 mb-2">
          <div className="font-medium text-base text-gray-900">NFT Owner</div>
          <p className="text-gray-700 text-base">{nftOwner}</p>
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
          {isOwner && (
            <>
              <div className="mt-4 md:mt-6">
                <button
                  onClick={onMintNFT}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700"
                >
                  List Invoice
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
