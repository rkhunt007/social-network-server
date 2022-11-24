const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Connect DB
connectDB();

app.use('/public', express.static('public'));

app.use(cors());

app.use(helmet());

// Init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send(`Auth Server Running ${process.env.PORT || 5000}`));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
