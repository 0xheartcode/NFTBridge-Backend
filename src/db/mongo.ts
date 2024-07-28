import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { IBridgeTransaction, IMintedToken } from '../types/dbInterfaces';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectMongo(): Promise<void> {
  try {
    await client.connect();
    console.log('Mongo Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export async function insertBridgeTransaction(transaction: IBridgeTransaction): Promise<void> {
  try {
    await client
      .db()
      .collection('BridgeTransactions')
      .insertOne(transaction as any);  // Using 'any' here to bypass strict type checking
    console.log(`Inserted bridge transaction: ${transaction.ethTxHash}`);
  } catch (error) {
    console.error('Error inserting bridge transaction:', error);
    throw error;
  }
}

export async function updateBridgeTransaction(update: Partial<IBridgeTransaction>): Promise<void> {
  try {
    const result = await client
      .db()
      .collection('BridgeTransactions')
      .updateOne(
        { ethTxHash: update.ethTxHash },
        { $set: update }
      );
    console.log(`Updated bridge transaction: ${update.ethTxHash}. Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Error updating bridge transaction:', error);
    throw error;
  }
}

export async function getAllPendingBridgeTransactions(): Promise<IBridgeTransaction[]> {
  try {
    const pendingTxs = await client
      .db()
      .collection('BridgeTransactions')
      .find({ status: 'Pending' })
      .toArray();
    //console.log(`Retrieved ${pendingTxs.length} pending bridge transactions`);
    return pendingTxs as unknown as IBridgeTransaction[];
  } catch (error) {
    console.error('Error fetching pending bridge transactions:', error);
    return [];
  }
}

export async function getBridgeTransactions(filter: any): Promise<IBridgeTransaction[]> {
  try {
    const txs = await client
      .db()
      .collection('BridgeTransactions')
      .find(filter)
      .toArray();
    return txs as unknown as IBridgeTransaction[];
  } catch (error) {
    console.error('Error getting all bridge transactions:', error);
    throw error;
  }
}

export async function getBridgeTransactionByTxHash(txHash: string): Promise<IBridgeTransaction | null> {
  try {
    const tx = await client
      .db()
      .collection('BridgeTransactions')
      .findOne({ $or: [{ ethTxHash: txHash }, { networkTxHash: txHash }] });
    return tx as unknown as IBridgeTransaction | null;
  } catch (error) {
    console.error('Error getting bridge transaction by txHash:', error);
    throw error;
  }
}

export async function insertMintedToken(token: IMintedToken): Promise<void> {
  try {
    await client
      .db()
      .collection('MintedTokens')
      .insertOne(token as any);  // Using 'any' here to bypass strict type checking
    console.log(`Inserted minted token: ${token.tokenId}`);
  } catch (error) {
    console.error('Error inserting minted token:', error);
    throw error;
  }
}

export async function getMintedTokens(): Promise<IMintedToken[]> {
  try {
    const tokens = await client
      .db()
      .collection('MintedTokens')
      .find()
      .toArray();
    return tokens as unknown as IMintedToken[];
  } catch (error) {
    console.error('Error getting minted tokens:', error);
    throw error;
  }
}

export async function updateBridgeTransactionStatus(ethTxHash: string, status: string, networkTxHash?: string): Promise<boolean> {
  try {
    const updateObject: any = { status: status };
    if (networkTxHash) {
      updateObject.networkTxHash = networkTxHash;
    }

    const result = await client
      .db()
      .collection('BridgeTransactions')
      .updateOne(
        { ethTxHash: ethTxHash },
        { $set: updateObject }
      );

    console.log(`Updated status for transaction ${ethTxHash} to ${status}. NETWORK hash: ${networkTxHash || 'Not provided'}. Modified: ${result.modifiedCount}`);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating bridge transaction status:', error);
    return false;
  }
}

export async function getAllFailedBridgeTransactions(): Promise<IBridgeTransaction[]> {
  try {
    const failedTxs = await client
      .db()
      .collection('BridgeTransactions')
      .find({ status: 'Failed' })
      .toArray();
    console.log(`Retrieved ${failedTxs.length} failed bridge transactions`);
    return failedTxs as unknown as IBridgeTransaction[];
  } catch (error) {
    console.error('Error fetching failed bridge transactions:', error);
    return [];
  }
}

