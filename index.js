const express = require('express');
const app = express();
// PATH ALLOWS US TO USE .JOIN WHICH SETS THE VIEWS THAT JS LOOKS FOR TO BE OUR DIRECTORY NAMED VIEWS
const path = require('path');
// METHOD OVERRIDE ALLOWS POST REQUESTS TO BE DISGUISED AS PATCH OR PUT REQUESTS
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant.js');
const Product = require('./models/product.js');
const { findById } = require('./models/restaurant.js');
const Review = require('./models/review.js');
const joi = require('joi');
const { restaurantSchema, productSchema, reviewSchema } = require('./schemas.js')

const catchAsync = require('./Utilities/catchAsync.js');
const ExpressError = require('./Utilities/ExpressError.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
main();
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/rate-plates')
        .then(() => { console.log("MONGOOSE CONNECTION OPEN") })
        .catch(err => { console.log("ERROR! NO MONGOOSE CONNECTION"), err })
}

// URLENCODED WILL ALLOW US TO PULL INFORMATION FROM THE REQ.BODY AND USE IT
app.use(express.urlencoded({ extended: true }));
// THIS WILL USE THE METHOD FROM THE HTML FORMS ACTION BUT DISGUISE IT AS WHAT YOU SET UNDER _METHOD
app.use(methodOverride('_method'));
// THIS WILL PULL THE STATUS CODE AND ERR MESSSAGE FROM THE ERR, SET THE STATUS TO THAT CODE AND SEND THAT MESSAGE 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = "Oh no, Something went wrong!" };
    res.status(statusCode).render('error.ejs', { err });
})


app.get('/', (req, res) => {
    res.send("WORKING");
})

app.get('/makeRestaurant', async (req, res) => {
    const restaurant = new Restaurant({ title: "Draft Republic", location: "San Marcos, CA", cuisine: "American" });
    await restaurant.save();
    res.send(restaurant);
})


const validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// THIS IS TO SHOW ALL RESTAURANTS IN THE DATABASE ON THE INDEX PAGE
app.get('/restaurants', catchAsync(async (req, res) => {
    const restaurants = await Restaurant.find({});
    res.render('restaurants/index.ejs', { restaurants });
}))

// THIS IS TO SHOW A CREATE FORM TO THE USER THAT WILL CREATE A NEW RESTAURANT
app.get('/restaurants/new', (req, res) => {
    res.render('restaurants/new.ejs')
})

// THIS IS TO SAVE THE NEWLY CREATED RESTAURANT TO THE DATABASE
app.post('/restaurants', validateRestaurant, catchAsync(async (req, res) => {
    const newRestaurant = new Restaurant(req.body.restaurant);
    await newRestaurant.save();
    res.redirect(`/restaurants/${newRestaurant._id}`);
}))

// THIS IS TO SHOW THE DETAILS OF AN INDIVIDUAL RESTAURANT TO THE USER
app.get('/restaurants/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id).populate('products');
    res.render('restaurants/show.ejs', { restaurant });
}))

// THIS IS TO SHOW AN EDIT FORM FOR AN INDIVIDUAL RESTAURANT'S DETAILS
app.get('/restaurants/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    res.render('restaurants/edit.ejs', { restaurant });
}))

// THIS IS TO UPDATE THE INDIVIDUAL RESTAURANT'S DETAILS AND POST THE UPDATE TO THE DATABASE
app.put('/restaurants/:id', validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
    res.redirect(`/restaurants/${restaurant._id}`);
}))

// THIS IS TO DELETE AN ENTIRE RESTAURANT FROM THE DATABASE
app.delete('/restaurants/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
    console.log(deletedRestaurant);
    res.redirect('/restaurants');
}))









// THIS IS TO SHOW A CREATE FORM TO THE USER THAT WILL CREATE A NEW PRODUCT
app.get('/restaurants/:id/products/new', catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    res.render('products/new.ejs', { restaurant });
}))

// THIS IS TO POST THE NEWLY CREATED PRODUCT ON TO THE RESTAURANTS ARRAY OF PRODUCTS AND SAVE TO DATABASE
app.post('/restaurants/:id/products', validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    const newProduct = new Product(req.body.product);
    restaurant.products.push(newProduct);
    newProduct.restaurant = restaurant;
    await restaurant.save();
    await newProduct.save();
    res.redirect(`/restaurants/${restaurant._id}`);
}))

// THIS IS TO SHOW THE DETAILS OF AN INDIVIDUAL PRODUCT TO THE USER
app.get('/restaurants/:restaurantId/products/:productId', catchAsync(async (req, res) => {
    const { productId, restaurantId } = req.params;
    const product = await Product.findById(productId).populate('reviews');
    const restaurant = await Restaurant.findById(restaurantId);
    res.render('products/show.ejs', { product, restaurant });
}))

// THIS IS TO SHOW A FORM TO THE USER THAT ALLOWS THEM TO EDIT AN INDIVIDUAL PRODUCTS DETAILS
app.get('/restaurants/:restaurantId/products/:productId/edit', catchAsync(async (req, res) => {
    const { productId, restaurantId } = req.params;
    const product = await Product.findById(productId);
    const restaurant = await Restaurant.findById(restaurantId);
    res.render('products/edit.ejs', { product, restaurant })
}))

// THIS IS TO UPDATE THE INDIVIDUAL PRODUCT'S DETAILS AND POST THE UPDATE TO THE DATABASE
app.put('/restaurants/:restaurantId/products/:productId', validateProduct, catchAsync(async (req, res) => {
    const { productId, restaurantId } = req.params;
    const product = await Product.findByIdAndUpdate(productId, { ...req.body.product });
    const restaurant = await Restaurant.findById(restaurantId);
    res.redirect(`/restaurants/${restaurant._id}/products/${product._id}`);
}))

// THIS IS TO DELETE AN INDIVIDUAL PRODUCT FROM THE RESTAURANT AND THE DATABASE
app.delete('/restaurants/:restaurantId/products/:productId', catchAsync(async (req, res) => {
    const { productId, restaurantId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    const restaurant = await Restaurant.findById(restaurantId);
    res.redirect(`/restaurants/${restaurant._id}`)
}))









// THIS IS TO POST A REVIEW FROM THE USER FORM TO AN INDIVIDUAL PRODUCT AND SAVE TO DATABASE
app.post('/restaurants/:restaurantId/products/:productId/reviews', validateReview, catchAsync(async (req, res) => {
    const { restaurantId, productId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    const product = await Product.findById(productId);
    const review = new Review(req.body.review);
    product.reviews.push(review);
    await review.save();
    await product.save();
    res.redirect(`/restaurants/${restaurant._id}/products/${product._id}`);
}))

// THIS IS TO DELETE AN INDIVIDUAL PRODUCT'S REVIEW AND THE REFERENCE TO THAT REVIEW ON THE PRODUCT
app.delete('/restaurants/:restaurantId/products/:productId/reviews/:reviewId', catchAsync(async (req, res) => {
    const { restaurantId, productId, reviewId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    const product = await Product.findById(productId);
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/restaurants/${restaurant._id}/products/${product._id}`)

}))


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


app.listen(3000, () => { console.log("Listening on Port 3000...") });