const AppError = require('./../utils/appError');

const handleJWTError = (err) => {
	return new AppError(err.message, 401);
}

const handleJWTExpiredError = () => {
	const message = 'Your token has expired. Please log in again'
	return new AppError(message, 401);
}

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/);

	const message = `Duplicate field value: ${value}. Please use another value`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map(el => el.message);

	const message = `Invalid input data ${errors.join('. ')}`;
	return new AppError(message, 400);
};

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
		// Create a new error object based on the original error's prototype
		let error = Object.create(err);

		if (err.name === 'CastError') error = handleCastErrorDB(error);
		if (err.code === 11000) error = handleDuplicateFieldsDB(error);
		if (err.name === "ValidationError") error = handleValidationErrorDB(error);
		if (err.name === "JsonWebTokenError") error = handleJWTError(error);
		if(err.name === "TokenExpiredError") handleJWTExpiredError();

		sendErrorProd(error, res);
	}
};