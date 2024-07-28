// src/dbcode/dbSetup.ts

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import MongoDbClient from './mongoDbClient';
import { ethers } from 'ethers';

const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log('Neither .env.local nor .env file found.');
}

export function checkRequiredEnvVariables() {
  const requiredVariables = [
    'MONGO_URI',
    'PRIVATEKEY',
    'ETH_RPC',
    'NETWORK_RPC',
    'NFT_ETH_ADDRESS',
    'BRIDGE_ETH_ADDRESS',
    'NFT_NETWORK_ADDRESS'
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      console.error(`Error: Required environment variable ${variable} is not set.`);
      process.exit(1);
    }
  }

  // Validate PRIVATEKEY
  try {
    new ethers.Wallet(process.env.PRIVATEKEY as string);
  } catch {
    console.error('Error: PRIVATEKEY is invalid. Please check your .env file.');
process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI as string; 

  try {
    const url = new URL(mongoUri);
    if (!url.pathname || url.pathname === '/') {
      console.error('Error: No database specified in MONGO_URI');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error: Invalid MONGO_URI', error);
    process.exit(1);
  }
  
  console.log('All required environment variables are set.');
}

let dbClient: MongoDbClient;

export async function initializeDatabase() {
  const mongoUri = process.env.MONGO_URI as string;

  dbClient = new MongoDbClient(mongoUri);
  await dbClient.connect();

  const bearerToken = process.env.INITIAL_BEARER_TOKEN;
  if (bearerToken) {
    const currentToken = await dbClient.getCurrentBearerTokenDB();
    if (currentToken === null) {
      await dbClient.setBearerTokenDB(bearerToken);
      console.log('Initial bearer token set from environment variable');
    }
  } else {
    console.log('No initial bearer token provided in environment variables');
  }
}

export { dbClient };

console.log('Database setup module loaded');
