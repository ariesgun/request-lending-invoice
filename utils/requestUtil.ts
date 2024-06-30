import { mainnet, polygon, sepolia } from "viem/chains";
import { polygonAssets, sepoliaAssets } from "./currency";

export const parsePaymentNetwork = (pn: string) => {
  if (pn === "pn-erc20-transferable-receivable") {
    return "ERC20TransferableReceivable NFT";
  } else if (pn === "pn-erc20-fee-proxy-contract") {
    return "Fee Proxy Contract";
  }
};

export const getChainFromRequest = (requestData: any) => {
  let chain;
  if (requestData?.currencyInfo?.network === "matic") {
    chain = polygon;
  } else if (requestData?.currencyInfo?.network === "sepolia") {
    chain = sepolia;
  } else {
    chain = mainnet;
  }
  return chain;
};

export const getAssetsList = (requestData: any) => {
  let assets;
  if (requestData?.currencyInfo?.network === "matic") {
    assets = polygonAssets;
  } else if (requestData?.currencyInfo?.network === "sepolia") {
    assets = sepoliaAssets;
  } else {
    assets = sepoliaAssets;
  }

  return assets;
};
