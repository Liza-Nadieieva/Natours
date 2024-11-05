const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

//1) middlewares
if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
};
//morgan will return function similar to use 
//it show information on the console about the request we did


app.use(express.json()); //middleware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	console.log('hello from the middleware');
	next();
});

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString(); // show the exact time of request
	next();
})

// 3) ROUTES

app.use('/api/v1/tours', tourRouter); //tourRouter is a middleware as userRouter
app.use('/api/v1/users', userRouter);

// all() all http requests

app.all('*', (req, res, next) => {
	// const err = new Error(`can't find ${req.originalUrl} on this server`);
	// err.status = 'fail';
	// err.statusCode = 400; 
	// next(err);
	next(new AppError(`can't find ${req.originalUrl} on this server`, 404))
});

//error handling middleware
app.use(globalErrorHandler);

module.exports = app;



