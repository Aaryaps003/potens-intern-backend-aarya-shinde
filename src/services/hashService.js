const crypto = require('crypto');
const stringify = require('json-stable-stringify');

// The 64-character string representing the start of the chain, as required
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function generateHash(previousHash, actor, action, payload, timestamp) {
  
  const payloadStr = stringify(payload);
  
  
  const data = `${previousHash}${actor}${action}${payloadStr}${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  GENESIS_HASH,
  generateHash
};