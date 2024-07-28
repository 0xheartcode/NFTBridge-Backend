// src/core/config.ts

import { ethers } from 'ethers';

export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const providers = {
  ethereum: new ethers.JsonRpcProvider(getRequiredEnvVar('ETH_RPC')),
  network: new ethers.JsonRpcProvider(getRequiredEnvVar('NETWORK_RPC')),
};

export const addresses = {
  nftEth: getRequiredEnvVar('NFT_ETH_ADDRESS'),
  bridgeEth: getRequiredEnvVar('BRIDGE_ETH_ADDRESS'),
  nftNetwork: getRequiredEnvVar('NFT_NETWORK_ADDRESS'),
};

export const BRIDGE_ABI = [
  "event Locked(address indexed owner, uint256[] tokenIds, uint256[] amounts)"
];

export const NFT_ABI = [
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];
