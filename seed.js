const axios = require('axios');
const faker = require('faker');
require('dotenv').config();

let myArgs = process.argv.slice(2);
const BASEURL = process.env.BASEURL || 'http://localhost:5000/api';
let status = ['Single', 'Married']
let maximum = 1, minimum = 0;

async function seed() {

    let user = {
        name: faker.name.firstName() + ' ' +  faker.name.lastName(),
        email: faker.internet.email(),
        password: '123456'
    }
   
    try {
        
        let res = await axios.post(BASEURL + 'users/register', user);
        let imageRes = await axios.get('https://randomuser.me/api/');
        imageRes = imageRes.data.results[0].picture.large;
        
        const choice = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        console.log('choice', choice);
        const token = res.data.token;
        const data = {
            friends: 0,
            bio: faker.lorem.sentence(),
            profession: faker.name.jobTitle(),
            city: faker.address.city(),
            relationship_status: status[choice]
        }
        res = await axios.post(BASEURL + 'profile', data, { headers: {'x-auth-token': token} });
        res = await axios.post(BASEURL + 'profile/image', {path: imageRes}, { headers: {'x-auth-token': token} });
    } catch (error) {
        console.log("Error: ", error.response.data);
    }

};

async function init() {
    for (let i = 0; i < myArgs[0]; i++) {
        console.log('### adding user', i);
        await seed();
        console.log('### adding user done', i);
    
    }
}

init();