/// <reference types="react-scripts" />

interface Window {
  ethereum?: any;
}

interface InvoiceNFTType {
  owner: `0x${string}`;
  tokenId: bigint;
  isListed: boolean;
  requestId: string;
}
