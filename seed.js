const axios = require('axios');
const faker = require('faker');
require('dotenv').config();

let myArgs = process.argv.slice(2);
const BASEURL = process.env.BASEURL || 'http://localhost:5000/api';
let status = ['Single', 'Married']

async function seed() {

    let user = {
        name: faker.name.firstName() + ' ' +  faker.name.lastName(),
        email: faker.internet.email(),
        password: '123456'
    }
   
    try {
        let res = await axios.post(BASEURL + 'users/register', user);
        const token = res.data.token;
        const data = {
            friends: 0,
            bio: faker.lorem.sentence(),
            profession: faker.name.jobTitle(),
            city: faker.address.city(),
            relationship_status: ''
        }
        res = await axios.post(BASEURL + 'profile', data, { headers: {'x-auth-token': token} });
    } catch (error) {
        console.log("Error: ", error.response.data);
    }

};

for (let i = 0; i < myArgs[0]; i++) {
    seed();
}