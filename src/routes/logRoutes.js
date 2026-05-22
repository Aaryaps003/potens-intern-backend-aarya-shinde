const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { requireAuth } = require('../middlewares/auth');

// Note: /verify and /export must go BEFORE /:id
router.get('/verify', requireAuth, logController.verifyChain);
router.get('/export', requireAuth, logController.exportLogs);
router.get('/:id', requireAuth, logController.getLog);

router.post('/', requireAuth, logController.createLog);

module.exports = router;