require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const logRoutes = require('./routes/logRoutes');

const app = express();

app.use(helmet()); 
app.use(express.json()); 

app.use('/log', logRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});