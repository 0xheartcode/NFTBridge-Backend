import express from 'express';
import * as basicHandler from './handlers/basicHandler';
import * as blockchainHandler from './handlers/blockchainHandler';
import { authenticateToken } from './middleware/auth';

const router = express.Router();
//
// BASIC AUTH
const basicRouter = express.Router();
basicRouter.get('/getPing', basicHandler.ping);  // Unrestricted Token Security 
basicRouter.get('/getSafePing', authenticateToken, basicHandler.safePing);
basicRouter.post('/setBearerToken', basicHandler.setNewBearerToken);    // Unrestricted Token Security 
basicRouter.get('/getCurrentToken', authenticateToken, basicHandler.getCurrentToken);  
basicRouter.post('/changeBearerToken', authenticateToken, basicHandler.changeBearerToken);  

router.use('/basic', basicRouter);


// blockchain routes
// BLOCKCHAIN PRIVATE
router.get('/bridge/transactions', blockchainHandler.getBridgeTransactionHistory);
router.get('/bridge/transactions/failed', blockchainHandler.getFailedBridgeTransactions);
router.get('/bridge/transactions/pending', blockchainHandler.getPendingBridgeTransactions);

router.get('/bridge/status/:txHash', blockchainHandler.getBridgeTransactionStatus);
router.post('/bridge/resolve/:ethTxHash', authenticateToken, blockchainHandler.resolvePendingTransaction);


router.get('/tokens/balance', blockchainHandler.getTokenBalances);
router.get('/tokens/minted', blockchainHandler.getMintedTokensHandler);


// BLOCKCHAIN PUBLIC
router.get('/metadata/:tokenId', blockchainHandler.getTokenMetadata);

export default router;
