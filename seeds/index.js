const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant.js');
const cities = require('./cities');
const { restaurantNames } = require('./seedHelpers');

mongoose.set('strictQuery', false);
main();
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/rate-plates')
        .then(() => { console.log("MONGOOSE CONNECTION OPEN") })
        .catch(err => { console.log("ERROR! NO MONGOOSE CONNECTION"), err })
}

const seedDB = async () => {
    await Restaurant.deleteMany({});
    for (let i = 0; i < 25; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random37 = Math.floor(Math.random() * 37);
        const restaurant = new Restaurant({
            title: `${restaurantNames[random37]}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await restaurant.save();
    }
}
seedDB()
    .then(() => {
        mongoose.connection.close();
    })