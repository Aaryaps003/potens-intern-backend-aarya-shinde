require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const logRoutes = require('./routes/logRoutes');
const logger = require('./config/logger'); // 🛑 NEW: Import your pino logger

const app = express();

app.use(helmet()); 
app.use(express.json()); 

app.use('/log', logRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Potens Tamper-Evident Log Service',
    status: 'Operational',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {

  logger.info(`Server is running on port ${PORT}`);
});