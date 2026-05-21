const db = require('../db');
const { generateHash, GENESIS_HASH } = require('./hashService');

async function getLatestLog() {
  const result = await db.query('SELECT hash FROM logs ORDER BY id DESC LIMIT 1');
  return result.rows.length > 0 ? result.rows[0].hash : GENESIS_HASH;
}

async function appendLog(actor, action, payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const previousHash = await getLatestLog();
      const timestamp = Date.now();
      const hash = generateHash(previousHash, actor, action, payload, timestamp);

      const result = await db.query(
        `INSERT INTO logs (actor, action, payload, timestamp, previous_hash, hash) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [actor, action, payload, timestamp, previousHash, hash]
      );
      
      return result.rows[0];
    } catch (error) {
      // 23505 is PostgreSQL's error code for a unique_violation
      if (error.code === '23505' && error.constraint === 'logs_previous_hash_key') {
        continue; // A concurrency collision happened. Loop restarts and tries again.
      }
      throw error;
    }
  }
  throw new Error('Failed to append log after maximum retries due to high concurrency');
}

module.exports = { appendLog };