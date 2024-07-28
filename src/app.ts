import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import routes from './routes';
import { checkRequiredEnvVariables, initializeDatabase } from './dbcode/dbSetup';
import { connectMongo } from './db/mongo';
import { listenForLock, mintOnNETWORK } from './blockchain/contractFunctions';
//import { listenToEthBridgeEvents } from './blockchain/listeners/ethListener';

import { overrideConsoleMethods } from './helpers/utils';

overrideConsoleMethods();


// Recreate __dirname functionality
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
// Check required environment variables
checkRequiredEnvVariables();

// Initialize database connection
await initializeDatabase();

// Connect to MongoDB
await connectMongo();

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json()); 

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));
// Apply routes
app.use('/', routes);

// Start listening for Lock events
//listenToEthBridgeEvents();
listenForLock();

// Set up periodic minting process
setInterval(mintOnNETWORK, 60000); // Check every minute

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('Basic Operations:');
  console.log('  - GET /basic/getPing: Basic ping (unrestricted)');
  console.log('  - GET /basic/getSafePing: Authenticated ping');
  console.log('  - POST /basic/setBearerToken: Set new bearer token');
  console.log('  - GET /basic/getCurrentToken: Get current bearer token');
  console.log('  - POST /basic/changeBearerToken: Change bearer token');
});
// Examples should be on Postman
server.on('error', (e: Error & { code?: string }) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try the following:`);
    console.error(`1. Stop any other servers running on port ${PORT}`);
    console.error(`2. Choose a different port by setting the PORT environment variable`);
    console.error(`3. Wait a few seconds and try again (the port might be in a cleanup state)`);
  } else {
    console.error('An unexpected error occurred:', e.message);
  }
  process.exit(1);
});
