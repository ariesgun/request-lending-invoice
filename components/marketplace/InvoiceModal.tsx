import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import InvoiceInfo from "./InvoiceInfo";
import {
  approveErc20,
  approveErc20IfNeeded,
  hasErc20Approval,
  hasReceivableForRequest,
  mintErc20TransferableReceivable,
  payErc20Request,
  payErc20TransferableReceivableRequest,
} from "@requestnetwork/payment-processor";
import { clientToProvider, useEthersProvider } from "@/utils/etherProvider";
import { useConnectWallet } from "@web3-onboard/react";
import { Request, Types } from "@requestnetwork/request-client.js";
import { getRequestPaymentValues } from "@requestnetwork/payment-processor/dist/payment/utils";
import { STATE } from "@requestnetwork/types/dist/request-logic-types";
import { useEthersSigner } from "@/utils/etherWagmi";
import { createWalletClient, custom } from "viem";
import { mainnet, polygon, sepolia } from "viem/chains";

interface InvoiceModalProps {
  request: Request;
}

const InvoiceModal = ({ request }: InvoiceModalProps) => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const [{ wallet }] = useConnectWallet();

  const requestData: IRequestDataWithEvents = request.getData();

  const [openModal, setOpenModal] = useState(false);

  const [isMinted, setIsMinted] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isPayer, setIsPayer] = useState(false);
  const [isCorrectChain, setIsCorrectChain] = useState(true);

  let targetChain;
  if (requestData?.currencyInfo?.network === "matic") {
    targetChain = polygon;
  } else if (requestData?.currencyInfo?.network === "sepolia") {
    targetChain = sepolia;
  } else {
    targetChain = mainnet;
  }

  const onSwitchChain = async () => {
    const clien = createWalletClient({
      chain: targetChain,
      transport: custom(window.ethereum!),
    });
    clien.switchChain({ id: targetChain.id });
    setOpenModal(false);
  };

  const onMint = async () => {
    const mintTx = await mintErc20TransferableReceivable(requestData, signer!);
    await mintTx.wait(2);

    setOpenModal(false);
  };

  const onAccept = async () => {
    await request.accept({
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: wallet?.accounts[0].address as string,
    });

    setOpenModal(false);
  };

  const onPay = async () => {
    const hasApproval: boolean = await hasErc20Approval(
      requestData,
      wallet?.accounts[0].address as string,
      signer!
    );
    if (!hasApproval) {
      const approvalTx = await approveErc20(requestData, signer!);
      await approvalTx.wait(2);
    }

    const paymentTx = await payErc20Request(requestData, signer);
    await paymentTx.wait(2);

    setOpenModal(false);
  };

  const onOpen = () => {
    const address = wallet?.accounts[0].address;

    if (requestData) {
      setIsPayer(address === requestData.payer?.value);

      // Check correct network
      provider
        ?.getNetwork()
        .then((res) => {
          const curChain = res.chainId;
          setIsCorrectChain(curChain === targetChain.id);

          if (isCorrectChain) {
            if (
              requestData?.extensionsData[0].id ===
              "pn-erc20-transferable-receivable"
            ) {
              hasReceivableForRequest(requestData, provider!)
                .then((res) => {
                  setIsMinted(res);

                  if (requestData.state === STATE.ACCEPTED) {
                    setIsAccepted(true);
                  }
                  if (
                    requestData?.balance?.balance! >=
                    requestData?.expectedAmount
                  ) {
                    setIsPaid(true);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              setIsMinted(true);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    console.log(address, isPayer, isPaid, isMinted, isAccepted, isCorrectChain);
    setOpenModal(true);
  };

  return (
    <>
      <button
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green dark:hover:bg-green-700 dark:focus:ring-green-700"
        onClick={onOpen}
      >
        Toggle modal
      </button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>History</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <InvoiceInfo
              request={requestData}
              isMinted={isMinted}
              isAccepted={isAccepted}
              isPaid={isPaid}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!isCorrectChain ? (
            <Button onClick={onSwitchChain}>Switch Chain</Button>
          ) : (
            <>
              {!isPayer && !isMinted && <Button onClick={onMint}>Mint</Button>}
              {isPayer && isMinted && !isAccepted && (
                <Button onClick={onAccept}>Accept</Button>
              )}
              {isPayer && isMinted && isAccepted && !isPaid && (
                <Button onClick={onPay}>Pay</Button>
              )}
            </>
          )}
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InvoiceModal;
