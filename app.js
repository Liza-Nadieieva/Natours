const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

//1) GLOBAL middlewares
//set secutity HTTP headers
app.use(helmet());

//development logging
if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
};

//limit requests from same API 
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);



//morgan will return function similar to use 
//it show information on the console about the request we did

//body parser , reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); 

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS 
app.use(xss());

//prevent parameter pollution
app.use(
	hpp({ 
		whitelist: [
			'duration',
			'ratingsQuantity',
			'difficulty', 
			'maxGroupSize', 
			'price', 
			'ratingsAverage'
		]
	})
);

//serving static files
app.use(express.static(`${__dirname}/public`));

//test middleware
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



