require('dotenv').config();
const logService = require('../services/logService');
const logger = require('../config/logger');

async function run() {
  logger.info('Starting full chain cryptographic verification...');
  
  try {
    const startTime = Date.now();
    const result = await logService.verifyFullChain();
    const duration = Date.now() - startTime;

    if (result.pass) {
      logger.info(`✅ Verification Passed in ${duration}ms: The entire log chain is intact and untampered.`);
    } else {
      logger.error(`❌ Verification Failed: Tampering detected! Chain broken at log ID ${result.firstBrokenId}`);
    }
  } catch (error) {
    logger.error({ err: error.message }, 'An error occurred during verification');
  } finally {
    // Force exit to close the database connection pool cleanly
    process.exit(0); 
  }
}

run();