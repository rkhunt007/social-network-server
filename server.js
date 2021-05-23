const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const faker = require('faker');

const app = express();

// Connect DB
connectDB();

app.use(cors());

app.use(helmet());

// Init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send(`Auth Server Running ${process.env.NODE_ENV}`));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT);

// mocking data
// let call = 0;
// setInterval(async function () {

//     let user = {
//         name: faker.name.firstName() + ' ' +  faker.name.lastName(),
//         email: faker.internet.email(),
//         password: '123456'
//     }

//     try {
//         const res = await axios.post(config.get('url') + '/api/users/register', user);
//         call++;
//         console.log(`Called ${call} time, and got`, res.data);
//     } catch (error) {
//         console.log("Error: ", error.response.data);
//     }

// }, config.get('timeout'));
