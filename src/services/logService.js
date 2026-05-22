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
      if (error.code === '23505' && error.constraint === 'logs_previous_hash_key') {
        continue; 
      }
      throw error;
    }
  }
  throw new Error('Failed to append log after maximum retries due to high concurrency');
}



async function getLogById(id) {
  const result = await db.query('SELECT * FROM logs WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;

  const log = result.rows[0];
  
  // Verify this specific log's integrity on the fly
  const calculatedHash = generateHash(log.previous_hash, log.actor, log.action, log.payload, log.timestamp);
  const isValid = calculatedHash === log.hash;

  return {
    ...log,
    chain_status: isValid ? 'VALID' : 'TAMPERED'
  };
}

async function verifyFullChain() {
 
  const result = await db.query('SELECT * FROM logs ORDER BY id ASC');
  const logs = result.rows;

  let previousHash = GENESIS_HASH;

  for (const log of logs) {
    const expectedHash = generateHash(previousHash, log.actor, log.action, log.payload, log.timestamp);
    
    
    if (expectedHash !== log.hash) {
      return { pass: false, firstBrokenId: log.id };
    }
    previousHash = log.hash;
  }

  return { pass: true, firstBrokenId: null };
}

async function exportLogs(filters) {
  let query = 'SELECT * FROM logs WHERE 1=1';  
  const params = [];
  let paramIndex = 1;

  if (filters.actor) {
    query += ` AND actor = $${paramIndex}`;
    params.push(filters.actor);
    paramIndex++;
  }
  if (filters.startDate) {
    query += ` AND timestamp >= $${paramIndex}`;
    params.push(parseInt(filters.startDate, 10));
    paramIndex++;
  }
  if (filters.endDate) {
    query += ` AND timestamp <= $${paramIndex}`;
    params.push(parseInt(filters.endDate, 10));
    paramIndex++;
  }

  query += ' ORDER BY timestamp ASC';
  const result = await db.query(query, params);
  return result.rows;
}

 
module.exports = { appendLog, getLogById, verifyFullChain, exportLogs };