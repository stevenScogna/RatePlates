const mongoose = require('mongoose');
const { Schema } = mongoose;

const restaurantSchema = new mongoose.Schema({
    title: String,
    location: String,
    cuisine: String,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;