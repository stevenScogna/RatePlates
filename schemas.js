const Joi = require('joi');

module.exports.restaurantSchema = Joi.object({
    restaurant: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        cuisine: Joi.string().required()
    }).required()
});

module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.string().required().min(1).max(10)
    }).required()
});