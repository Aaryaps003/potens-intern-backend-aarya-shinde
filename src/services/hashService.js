const crypto = require('crypto');
const stringify = require('json-stable-stringify');

// The 64-character string representing the start of the chain, as required
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function generateHash(previousHash, actor, action, payload, timestamp) {
  // Stable stringify ensures consistent hashing regardless of JSON key order
  const payloadStr = stringify(payload);
  
  // Concatenate exactly as specified in the assignment
  const data = `${previousHash}${actor}${action}${payloadStr}${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  GENESIS_HASH,
  generateHash
};