import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { logError, sleep, rpcLogError } from '../helpers/utils';
import { insertBridgeTransaction, updateBridgeTransaction, getAllPendingBridgeTransactions, updateBridgeTransactionStatus, insertMintedToken } from '../db/mongo';
import bridgeAbi from './abis/nftbridgeABI.json' assert { type: "json" };
import erc115abi from './abis/erc1155.json' assert { type: "json" };
import network1155abi from './abis/network1155.json' assert { type: "json" };
import { IBridgeTransaction, ILockedEvent } from '../types/dbInterfaces';
import { IMintedToken } from '../types/dbInterfaces';

dotenv.config();

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

interface Providers {
  ethereum: ethers.JsonRpcProvider;
  network: ethers.JsonRpcProvider;
}

const providers: Providers = {
  ethereum: new ethers.JsonRpcProvider(getRequiredEnvVar('ETH_RPC')),
  network: new ethers.JsonRpcProvider(getRequiredEnvVar('NETWORK_RPC')),
};

const addresses = {
  nftEth: getRequiredEnvVar('NFT_ETH_ADDRESS'),
  bridgeEth: getRequiredEnvVar('BRIDGE_ETH_ADDRESS'),
  nftNetwork: getRequiredEnvVar('NFT_NETWORK_ADDRESS'),
};

const tokenIds = ["0", "1", "2", "3"];

const minterWallet = new ethers.Wallet(getRequiredEnvVar('PRIVATEKEY'), providers.network);

interface Contracts {
  nftEth: ethers.Contract;
  bridgeEth: ethers.Contract;
  nftNetwork: ethers.Contract;
}

const contracts: Contracts = {
  nftEth: new ethers.Contract(addresses.nftEth, erc115abi, providers.ethereum),
  bridgeEth: new ethers.Contract(addresses.bridgeEth, bridgeAbi, providers.ethereum),
  nftNetwork: new ethers.Contract(addresses.nftNetwork, network1155abi, minterWallet),
};

export function listenForLock(): void {
  contracts.bridgeEth.on('Locked', async (toAddress: string, mediathree: BigInt, mediafour: BigInt, mediatwo: BigInt, mediaone: BigInt, event: ILockedEvent) => {
    console.log(`New Locked event to ${toAddress}`);
    //const fromAddress = event.args[0];
    const tx = await event.getTransaction();
    const fromAddress = tx.from;

    const ethTxHash = event.log.transactionHash;
    console.log('Full event structure:', JSON.stringify(event, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2
    ));

    const transaction: IBridgeTransaction = {
      ethTxHash: ethTxHash,
      fromChain: 'Ethereum',
      toChain: 'NETWORK',
      fromAddress: fromAddress,
      toAddress: toAddress,
      tokenIds: [0, 1, 2, 3],
      amounts: [mediathree, mediafour, mediatwo, mediaone].map(amount => Number(amount)),
      status: 'Pending',
      timestamp: new Date()
    };

    try {
      await insertBridgeTransaction(transaction);
      console.log(`Stored new bridge transaction: ${ethTxHash}`);
      console.log('Bridge TXs: ', 'From:', fromAddress, 'To:', toAddress, 'Amounts:', mediathree.toString(), mediafour.toString(), mediatwo.toString(), mediaone.toString());
    } catch (error: unknown) {
      console.error('Error storing bridge transaction:', error);
      logError(error, 'Error storing bridge transaction');
    }
  });

  console.log('Listening for Locks on ETH');
}

let currentlyMinting = false;

const NETWORKMINT_MAX_RETRIES = 2;
const NETWORKMINT_RETRY_DELAY = 10000; //10 seconds

export async function mintOnNETWORK(): Promise<void> {
  if (currentlyMinting) return;
  currentlyMinting = true;

  try {
    const allPending = await getAllPendingBridgeTransactions();
    if (allPending.length === 0) {
      return;
    }

    console.log(`Found ${allPending.length} pending bridge transactions`);
    for (const bridgeTx of allPending) {
      console.log('Processing bridge tx:', JSON.stringify(bridgeTx, null, 2));

      let retries = 0;
      while (retries < NETWORKMINT_MAX_RETRIES) {
        try {
          const tx = await contracts.nftNetwork.mint(bridgeTx.toAddress, tokenIds, bridgeTx.amounts);
          const receipt = await tx.wait();
          console.log('Full transaction receipt:', JSON.stringify(receipt, null, 2));
          console.log(`Minted tokens for transaction ${bridgeTx.ethTxHash}`);
          console.log(`hash ${receipt.hash}`)
          for (let i = 0; i < bridgeTx.tokenIds.length; i++) {
            if (bridgeTx.amounts[i] > 0) {
              const mintedToken: IMintedToken = {
                tokenId: bridgeTx.tokenIds[i].toString(),
                owner: bridgeTx.toAddress,
                amount: bridgeTx.amounts[i],
                mintHash: receipt.hash,
                mintedAt: new Date()
              };
              await insertMintedToken(mintedToken);
              console.log(`Inserted minted token info for tokenId: ${mintedToken.tokenId}, amount: ${mintedToken.amount}`);
            }
          }

          await updateBridgeTransaction({
            ethTxHash: bridgeTx.ethTxHash,
            networkTxHash: receipt.hash,
            status: 'Completed'
          });

          console.log(`Successfully minted:
                      ETH tx: ${bridgeTx.ethTxHash}
                      NETWORK tx: ${receipt.hash}
                      From: ${bridgeTx.fromAddress}
                      To: ${bridgeTx.toAddress}`);
          break; // Exit the retry loop on success
        } catch (error: unknown) {
          retries++;
          rpcLogError(error, `Failed to mint for transaction ${bridgeTx.ethTxHash} (Attempt ${retries}/${NETWORKMINT_MAX_RETRIES})`);
          if (retries < NETWORKMINT_MAX_RETRIES) {
            console.log(`Retrying in ${NETWORKMINT_RETRY_DELAY / 1000} seconds...`);
            await sleep(NETWORKMINT_RETRY_DELAY);
          } else {
            console.error(`Max retries reached for transaction ${bridgeTx.ethTxHash}. Moving to next transaction.`);
            await updateBridgeTransactionStatus(bridgeTx.ethTxHash, 'Failed');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in minting process:', error);
  } finally {
    currentlyMinting = false;
  }
}
