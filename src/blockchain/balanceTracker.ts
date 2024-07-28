import { ethers } from 'ethers';
import { providers, addresses } from '../helpers/config';
import { ITokenBalance } from '../types/dbInterfaces';

const ERC1155_ABI = [
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])"
];

const ethToNetworkTokenIdMap = new Map([
  ['11', '0'],
  ['22', '1'],
  ['33', '2'],
  ['44', '3']
]);

const networkToEthTokenIdMap = new Map(Array.from(ethToNetworkTokenIdMap.entries()).map(([ethId, networkId]) => [networkId, ethId]));

function mapTokenId(id: string, chain: 'Ethereum' | 'NETWORK'): string {
  const map = chain === 'Ethereum' ? ethToNetworkTokenIdMap : networkToEthTokenIdMap;
  const mappedId = map.get(id);
  if (mappedId === undefined) {
    throw new Error(`No mapping found for ${chain} token ID: ${id}`);
  }
  return mappedId;
}

async function getBalances(chain: 'Ethereum' | 'NETWORK', address: string, tokenIds: string[]): Promise<ITokenBalance> {
  const provider = chain === 'Ethereum' ? providers.ethereum : providers.network;
  const contractAddress = chain === 'Ethereum' ? addresses.nftEth : addresses.nftNetwork;
  
  const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
  
  const accounts = new Array(tokenIds.length).fill(address);
  const queryIds = chain === 'Ethereum' ? tokenIds : tokenIds.map(id => mapTokenId(id, 'NETWORK'));

  console.log(`Querying ${chain} balances for address: ${address}`);
  console.log('Token IDs:', queryIds);

  const balances = await contract.balanceOfBatch(accounts, queryIds);

  console.log('Raw balances:', balances.map(b => b.toString()));

  const balanceMap: { [tokenId: string]: number } = {};
  tokenIds.forEach((id, index) => {
    balanceMap[id] = parseInt(balances[index].toString(), 10);
  });

  console.log('Processed balances:', balanceMap);

  return {
    chain,
    address,
    balances: balanceMap,
    timestamp: new Date()
  };
}

export async function getEthereumBalances(address: string, tokenIds: string[]): Promise<ITokenBalance> {
  return getBalances('Ethereum', address, tokenIds);
}

export async function getNETWORKBalances(address: string, tokenIds: string[]): Promise<ITokenBalance> {
  return getBalances('NETWORK', address, tokenIds);
}

export async function getAllBalances(address: string, tokenIds: string[]): Promise<ITokenBalance[]> {
  console.log('Getting all balances for address:', address);
  console.log('Token IDs:', tokenIds);

  const ethTokenIds = tokenIds.filter(id => id.length > 10); // Assuming Ethereum IDs are the long ones
  const networkTokenIds = tokenIds.filter(id => id.length <= 10); // Assuming NETWORK IDs are 0, 1, 2, 3

  console.log('Ethereum Token IDs:', ethTokenIds);
  console.log('NETWORK Token IDs:', networkTokenIds);

  try {
    const [ethBalances, networkBalances] = await Promise.all([
      getEthereumBalances(address, ethTokenIds),
      getNETWORKBalances(address, networkTokenIds)
    ]);

    console.log('Ethereum Balances:', JSON.stringify(ethBalances, null, 2));
    console.log('NETWORK Balances:', JSON.stringify(networkBalances, null, 2));

    return [ethBalances, networkBalances];
  } catch (error) {
    console.error('Error in getAllBalances:', error);
    throw error;
  }
}
