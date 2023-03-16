const mongoose = require('mongoose');
const Product = require('./product');
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

restaurantSchema.post('findOneAndDelete', async function (restaurant) {
    if (restaurant.products.length) {
        const deleted = await Product.deleteMany({ _id: { $in: restaurant.products } })
        console.log(deleted)
    }
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;