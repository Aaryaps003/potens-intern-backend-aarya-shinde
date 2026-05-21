const logService = require('../services/logService');

async function createLog(req, res) {
  try {
    const { actor, action, payload } = req.body;

    if (!actor || !action || !payload) {
      return res.status(400).json({ error: 'Missing required fields: actor, action, payload' });
    }

    const logEntry = await logService.appendLog(actor, action, payload);
    res.status(201).json(logEntry);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createLog };