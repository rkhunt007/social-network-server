const axios = require('axios');
const faker = require('faker');
require('dotenv').config();

let myArgs = process.argv.slice(2);

async function seed() {

    let user = {
        name: faker.name.firstName() + ' ' +  faker.name.lastName(),
        email: faker.internet.email(),
        password: '123456'
    }

    try {
        const res = await axios.post(process.env.BASEURL + '/api/users/register', user);
    } catch (error) {
        console.log("Error: ", error.response.data);
    }

};

for (let i = 0; i < myArgs[0]; i++) {
    seed();
}