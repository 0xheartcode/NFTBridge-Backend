// src/types/dbInterfaces.ts
import { ObjectId} from 'mongodb';

export interface ITokenResult {
  token: string;
}

export interface IDbClient {
  setBearerTokenDB(token: string): Promise<boolean>;
  isValidBearerTokenDB(token: string): Promise<boolean>;
  getCurrentBearerTokenDB(): Promise<string | null>;
  changeBearerTokenDB(currentToken: string, newToken: string): Promise<boolean>;
}

export interface IBridgeTransaction {
  _id?: string;
  ethTxHash: string;
  networkTxHash?: string;  // Optional as it won't be available initially
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  tokenIds: number[];  // Array of token IDs for ERC-1155
  amounts: number[];   // Corresponding amounts for each token ID
  status: 'Pending' | 'Completed' | 'Failed';
  timestamp: Date;
}

export interface ITokenBalance {
  _id?: string;
  chain: string;
  address: string;
  balances: {
    [tokenId: number]: number;  // Map of token ID to balance
  };
  timestamp: Date;
}

export interface IErrorLog {
  _id?: string;
  errorType: string;
  message: string;
  stack?: string;
  relatedEthTxHash?: string;
  relatedNetworkTxHash?: string;
  timestamp: Date;
}

export interface IMintedToken {
  tokenId: string;
  owner: string;
  amount: number;
  mintedAt: Date;
  mintHash: string;
}

export interface ILockedEvent {
  args: [string, BigInt, BigInt, BigInt, BigInt];
  log: {
    transactionHash: string;
    blockNumber: number;
    logIndex: number;
    address: string;
    data: string;
    topics: string[];
    transactionIndex: number;
    blockHash: string;
    removed: boolean;
  };
  getTransaction: () => Promise<any>;
  getTransactionReceipt: () => Promise<any>;
  getBlock: () => Promise<any>;
}
