import("@ariesgun/invoice-dashboard");
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { InvoiceDashboardProps } from "@/types";
import { useConnectWallet } from "@web3-onboard/react";
import { Types } from "@requestnetwork/request-client.js";
import { request } from "http";
import {
  approveErc20,
  getReceivableTokenIdForRequest,
  hasErc20Approval,
  hasReceivableForRequest,
  hasSufficientFunds,
  mintErc20TransferableReceivable,
  payRequest,
} from "@requestnetwork/payment-processor";
import { WalletClient, createWalletClient, custom, http } from "viem";
import { mainnet, polygon, sepolia } from "viem/chains";
import { useEthersProvider } from "@/utils/etherProvider";
import { useEthersSigner } from "@/utils/etherWagmi";
import { IRequestData } from "@requestnetwork/request-client.js/dist/types";
import { useSwitchChain } from "wagmi";
import { BigNumber } from "ethers";

export default function PayUser() {
  const [{ wallet }] = useConnectWallet();
  const { requestNetwork } = useAppContext();
  const dashboardRef = useRef<InvoiceDashboardProps>(null);
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [client, setClient] = useState<WalletClient | undefined>(undefined);

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.config = config;

      if (wallet && requestNetwork) {
        dashboardRef.current.wallet = wallet;
        dashboardRef.current.requestNetwork = requestNetwork;
      }
    }

    const clien: WalletClient = createWalletClient({
      chain: mainnet,
      transport: custom(window?.ethereum!),
    });
    setClient(clien);

    // const identityAddress = "0xA6525F92D9Be3f4067bea30d47D1137194d3aa90";
    // requestNetwork
    //   ?.fromIdentity({
    //     type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
    //     value: identityAddress,
    //   })
    //   .then((requestData) => {
    //     const requestDatas = requestData?.map((request) => request.getData());
    //     setRequests(requestDatas);
    //   });
  }, [wallet, requestNetwork]);

  const handleMint = async () => {
    await client?.switchChain({ id: polygon.id });

    const identityAddress = "0xA6525F92D9Be3f4067bea30d47D1137194d3aa90";
    let requestData = await requestNetwork?.fromIdentity({
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: identityAddress,
    });

    const requestDatas = requestData?.map((request) => request.getData());

    console.log(requestData);
    let request_data = requestDatas![5];

    console.log("H", request_data);
    // console.log(
    //   "Transferable ",
    //   getPaymentNetworkExtension(request_data!)?.id ===
    //     Types.Extension.PAYMENT_NETWORK_ID.ERC20_TRANSFERABLE_RECEIVABLE
    // );

    let approved = await hasErc20Approval(
      request_data,
      identityAddress,
      signer!
    );
    console.log("Approved ", approved);

    await requestData![2].cancel({
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: identityAddress,
    });

    let receivable = await hasReceivableForRequest(request_data, signer!);
    if (!receivable) {
      const mintTx = await mintErc20TransferableReceivable(
        request_data,
        signer,
        {
          gasLimit: BigNumber.from("20000000"),
        }
      );
      const confirmedTx = await mintTx.wait(1);
    } else {
      let hell = await getReceivableTokenIdForRequest(request_data, signer!);
      console.log(hell);
      console.log("Minted");
    }
  };

  const handlePay = async () => {
    const identityAddress = "0xCaD2eC9b42E370C67Fa001e934B686D2236Fb5c5";
    let requestData: IRequestData;

    // await client.switchChain({ id: polygon.id });

    requestNetwork
      ?.fromIdentity({
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: identityAddress,
      })
      .then(async (requests) => {
        const requestDatas = requests?.map((request) => request.getData());

        console.log(requestDatas);
        requestData = requestDatas[1];

        console.log(await signer?.getBalance());
        console.log(requestData);

        hasSufficientFunds({
          request: requestData!,
          address: identityAddress,
          providerOptions: {
            provider: provider,
          },
        }).then(async (_hasSufficientFunds) => {
          console.log(_hasSufficientFunds);

          const _hasErc20Approval = await hasErc20Approval(
            requestData!,
            identityAddress,
            provider
          );
          if (!_hasErc20Approval) {
            const approvalTx = await approveErc20(requestData!, signer);
            await approvalTx.wait(2);
          }

          const paymentTx = await payRequest(requestData!, signer);
          await paymentTx.wait(2);
        });
      });
  };

  return (
    <>
      <Head>
        <title>Request Payment</title>
      </Head>
      <div className="container m-auto  w-[100%]">
        {/* <invoice-dashboard ref={dashboardRef} /> */}
        <button onClick={handlePay}>Pay Request</button>
        <button onClick={handleMint}>Mint Transferable Receivable</button>
      </div>
    </>
  );
}
