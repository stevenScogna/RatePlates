const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

productSchema.post('findOneAndDelete', async function (product) {
    if (product) {
        await review.deleteMany({
            _id: {
                $in: product.reviews
            }
        })
    }
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;