// THIS ACCEPTS A FUNCTION, RETURNS THAT FUNCTION EXECUTED WITH A CATCH AT THE END, AND SENDS THE ERROR TO THE ERROR HANDLER
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}