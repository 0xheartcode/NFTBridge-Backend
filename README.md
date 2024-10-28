# NFTBridge-Backend
 
A robust backend service that facilitates cross-chain NFT bridging between Ethereum and another blockchain network. This application listens for "Lock" events on Ethereum smart contracts, records transactions in MongoDB, and mints corresponding tokens on the destination blockchain.

## Features

- **Cross-Chain Bridging**: Bridge ERC-1155 tokens between Ethereum and the destination network
- **Event Monitoring**: Listen for "Lock" events on the Ethereum blockchain
- **Automatic Minting**: Process pending transactions and mint tokens on the destination chain
- **Transaction Tracking**: Record and monitor all bridge transactions with status updates
- **Balance Checking**: Query token balances across both blockchains
- **Token Metadata**: Serve metadata for NFTs with dynamic URL construction
- **Authentication**: Secure API endpoints with bearer token authentication
- **Dockerized Deployment**: Easily deploy using Docker with provided configurations

## Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Blockchain**: ethers.js for Web3 interactions
- **Authentication**: Bearer token authentication
- **Containerization**: Docker with docker-compose support
- **CI/CD**: GitHub Actions workflow ready

## Installation

### Prerequisites

- Node.js (v18+)
- Yarn v4+ 
- MongoDB instance
- Access to Ethereum and destination network RPCs

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/NFTBridge-Backend.git
   cd NFTBridge-Backend
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Configure environment variables by creating `.env.local` file:
   ```
   MONGO_URI=mongodb://your-mongodb-connection-string
   PRIVATEKEY=your-wallet-private-key
   ETH_RPC=https://ethereum-rpc-endpoint
   NETWORK_RPC=https://destination-network-rpc-endpoint
   NFT_ETH_ADDRESS=0x...your-ethereum-nft-contract-address
   BRIDGE_ETH_ADDRESS=0x...your-ethereum-bridge-contract-address
   NFT_NETWORK_ADDRESS=0x...your-destination-network-nft-contract-address
   INITIAL_BEARER_TOKEN=your-initial-api-token
   ```

4. Build the application
   ```bash
   yarn build
   ```

5. Start the server
   ```bash
   yarn start
   ```

### Docker Deployment

The project includes Docker configurations for easy deployment:

```bash
# Build the Docker image
make composebuild-prod

# Run the container
make run_container

# Check container logs
make logs
```

## API Endpoints

### Authentication Endpoints

- `GET /basic/getPing`: Basic ping (unrestricted)
- `GET /basic/getSafePing`: Authenticated ping
- `POST /basic/setBearerToken`: Set new bearer token
- `GET /basic/getCurrentToken`: Get current bearer token
- `POST /basic/changeBearerToken`: Change bearer token

### Blockchain Endpoints

- `GET /bridge/transactions`: Retrieve bridge transaction history
- `GET /bridge/transactions/failed`: Get failed bridge transactions
- `GET /bridge/transactions/pending`: Get pending bridge transactions
- `GET /bridge/status/:txHash`: Check transaction status
- `POST /bridge/resolve/:ethTxHash`: Manually resolve a pending transaction
- `GET /tokens/balance`: Check token balances for an address
- `GET /tokens/minted`: View all minted tokens
- `GET /metadata/:tokenId`: Get token metadata

## Core Components

### Blockchain Integration

The system monitors Ethereum for "Lock" events, indicating tokens have been locked for transfer. It then automatically mints corresponding tokens on the destination network.

### Token Mapping

The bridge maps between the following token types:
- mediaone (ID: 44 on Ethereum, 3 on destination network)
- mediatwo (ID: 33 on Ethereum, 2 on destination network)
- mediathree (ID: 11 on Ethereum, 0 on destination network)
- mediafour (ID: 22 on Ethereum, 1 on destination network)

### Transaction Processing

The application periodically checks for pending transactions and attempts to process them by minting tokens on the destination network. Failed transactions can be retried or manually resolved.

## Project Structure

```
.
├── src
│   ├── app.ts                 # Application entry point
│   ├── blockchain             # Blockchain interaction logic
│   │   ├── abis               # Contract ABIs
│   │   ├── balanceTracker.ts  # Token balance tracking
│   │   ├── contractFunctions.ts # Contract interactions
│   │   └── metadata.ts        # NFT metadata handling
│   ├── db                     # Database operations
│   ├── dbcode                 # Database client and setup
│   ├── handlers               # API route handlers
│   ├── helpers                # Utility functions
│   ├── middleware             # Express middleware
│   ├── routes.ts              # API routes
│   └── types                  # TypeScript interfaces
├── utils                      # Docker and configuration files
├── Makefile                   # Build and deployment commands
└── package.json               # Project dependencies
```

## CI/CD Workflow

This project is configured for automated deployment using GitHub Actions. The workflow is triggered when changes are pushed to the `prod` or `staging` branches. See `.github/workflows` for detailed configuration.

## Configuration

### Required Environment Variables

- `MONGO_URI`: MongoDB connection string
- `PRIVATEKEY`: Wallet private key for signing transactions
- `ETH_RPC`: Ethereum RPC endpoint
- `NETWORK_RPC`: Destination network RPC endpoint
- `NFT_ETH_ADDRESS`: Ethereum NFT contract address
- `BRIDGE_ETH_ADDRESS`: Ethereum bridge contract address 
- `NFT_NETWORK_ADDRESS`: Destination network NFT contract address

### Optional Environment Variables

Open to PRs ☕😺


Happy coding <(0_0)
