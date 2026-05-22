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
     
    console.error("💥 CRITICAL CRASH:", error); 
    
   
    res.status(500).json({ error: error.message }); 
  }
}

 

async function getLog(req, res) {
  try {
    const log = await logService.getLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function verifyChain(req, res) {
  try {
    const status = await logService.verifyFullChain();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function exportLogs(req, res) {
  try {
    const { actor, startDate, endDate } = req.query;
    const logs = await logService.exportLogs({ actor, startDate, endDate });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

 
module.exports = { createLog, getLog, verifyChain, exportLogs };