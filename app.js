const express = require('express');
const morgan = require('morgan');
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



module.exports = app;



