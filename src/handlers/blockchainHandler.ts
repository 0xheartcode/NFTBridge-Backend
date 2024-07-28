import { Request, Response } from 'express';
import { getMetadata } from '../blockchain/metadata';
import { getBridgeTransactions, getBridgeTransactionByTxHash, getMintedTokens, updateBridgeTransactionStatus, getAllFailedBridgeTransactions, getAllPendingBridgeTransactions } from '../db/mongo';
import { getAllBalances } from '../blockchain/balanceTracker';

export async function getTokenMetadata(req: Request, res: Response) {
  const tokenId = req.params.tokenId;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  try {
    const metadata = getMetadata(tokenId, baseUrl);
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getBridgeTransactionHistory(req: Request, res: Response) {
  const { startTime, endTime, fromAddress } = req.query;
  
  let filter: any = {};
  if (startTime || endTime) {
    filter.timestamp = {
      ...(startTime && { $gte: new Date(startTime as string) }),
      ...(endTime && { $lte: new Date(endTime as string) })
    };
  }
  
  if (fromAddress) {
    filter.fromAddress = fromAddress;
  }

  try {
    const transactions = await getBridgeTransactions(filter);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching bridge transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBridgeTransactionStatus(req: Request, res: Response) {
  const { txHash } = req.params;
  try {
    const transaction = await getBridgeTransactionByTxHash(txHash);
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error fetching bridge transaction status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTokenBalances(req: Request, res: Response) {
  const { address } = req.query;
  const ethTokenIds = [
    '11',
    '22',
    '33',
    '44'
  ];
  const networkTokenIds = ['0', '1', '2', '3'];

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address provided' });
  }

  try {
    const balances = await getAllBalances(address, [...ethTokenIds, ...networkTokenIds]);
    res.json(balances);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



export async function getMintedTokensHandler(req: Request, res: Response) {
  try {
    const mintedTokens = await getMintedTokens();
    res.json(mintedTokens);
  } catch (error) {
    console.error('Error fetching minted tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export async function resolvePendingTransaction(req: Request, res: Response) {
  const { ethTxHash } = req.params;
  const { resolveAddress } = req.query;

  if (!ethTxHash) {
    return res.status(400).json({ error: 'Ethereum transaction hash is required' });
  }

  try {
    const networkTxHash = resolveAddress && resolveAddress !== '0x0' ? resolveAddress.toString() : undefined;
    const result = await updateBridgeTransactionStatus(ethTxHash, 'Completed', networkTxHash);

    if (result) {
      res.json({ message: 'Transaction resolved successfully', ethTxHash, networkTxHash });
    } else {
      res.status(404).json({ error: 'Transaction not found or already resolved' });
    }
  } catch (error) {
    console.error('Error resolving transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFailedBridgeTransactions(req: Request, res: Response) {
  try {
    const failedTransactions = await getAllFailedBridgeTransactions();
    res.json(failedTransactions);
  } catch (error) {
    console.error('Error fetching failed bridge transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingBridgeTransactions(req: Request, res: Response) {
  try {
    const pendingTransactions = await getAllPendingBridgeTransactions();
    res.json(pendingTransactions);
  } catch (error) {
    console.error('Error fetching pending bridge transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
