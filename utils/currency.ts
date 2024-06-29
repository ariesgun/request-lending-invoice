export interface AssetInfo {
  symbol: string;
  decimals: number;
  network: string;
}

export interface NetworkAsset {
  [key: string]: AssetInfo;
}

export const sepoliaAssets: NetworkAsset = {
  "0xF046b3CA5ae2879c6bAcC4D42fAF363eE8379F78": {
    symbol: "USDT",
    decimals: 6,
    network: "sepolia",
  },
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": {
    symbol: "USDC",
    decimals: 6,
    network: "sepolia",
  },
  "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C": {
    symbol: "FAU",
    decimals: 18,
    network: "sepolia",
  },
};

export const polygonAssets: NetworkAsset = {
  "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359": {
    symbol: "USDC",
    decimals: 6,
    network: "matic",
  },
};
