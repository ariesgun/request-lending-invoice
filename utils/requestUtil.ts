export const parsePaymentNetwork = (pn) => {
  if (pn === "pn-erc20-transferable-receivable") {
    return "ERC20TransferableReceivable NFT";
  } else if (pn === "pn-erc20-fee-proxy-contract") {
    return "Fee Proxy Contract";
  }
};
