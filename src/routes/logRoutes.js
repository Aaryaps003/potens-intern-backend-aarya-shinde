const express = require('express');
const router = express.Router();


const logController = require('../controllers/logController');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, logController.createLog);

module.exports = router;