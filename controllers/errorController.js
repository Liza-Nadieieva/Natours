const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
	console.log('blah2')
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error : send message to client 
	if(err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});

	// Programming or other unknown error: don't leak details
	} else {
		//1) log error
		console.error('error!!', err);

		//2) send generic message
		res.status(500).json({
			status: 'err',
			message: 'Something went wrong'
		})
	}
};


module.exports = (err, req, res, next) => {
	// console.log(err.stack);
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if(process.env.NODE_ENV === 'development') {

		sendErrorDev(err, res);

	} else if(process.env.NODE_ENV === 'production') {
		// let error = { ...err };
		let error = new Error(err.message);
		// let error = Object.assign({}, err);
		error.name = err.name; // This preserves `err.name`, `err.path`, etc.
		console.log('blah1', error.name);

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		sendErrorProd(error, res);
	}
};