const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	// const newUser = await User.create(req.body); //User.save updating
	// console.log('newuser', newUser.passwordResetToken);
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.body.role,
	})
	console.log('newUser', newUser);

	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser
		}
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email ,password } = req.body;

	//1) Check if email and password exist
	if(!email  || !password) {
		return next(new AppError('Please provide email and password', 400));
	}
	//2) Check if user exists && password is correct 
	const user = await User.findOne({ email }).select('+password');  //email: email
	if(!user || !(await user.correctPassword(password, user.password))){
		return next(new AppError('Incorrect email or password', 401));
	} 

	//3) if everything okay, send token to client
	const token = signToken(user._id);

	res.status(200).json({
		status: 'success',
		token
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	//1) getting token and check of it's there 
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	if(!token) {
		return next(new AppError('You are not logged in! Please log in to get access', 401))
	}

	// //2) Verification token
	const verifyAsync = promisify(jwt.verify);
	const decoded = await verifyAsync(token, process.env.JWT_SECRET);
	// const decoded = await jwt.verifyAsync(token, process.env.JWT_SECRET);
	//const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

	//3) check if user still exists
	const currentUser = await User.findById(decoded.id);
	if(!currentUser) {
		return next(new AppError('The user belonging to this token does no longer exist', 401))
	}

	//4) check if user changed password after the token was issued
	if(currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('User recently changed the password. Please log in again', 401))
	};

	//Grant access to protected route
	req.user = currentUser;
	next();
	
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		//roles ['admin', 'lead-guide']. role ='user'
		if(!roles.includes(req.user.role)){
			return next(new AppError('You do not have permission to perform this action', 403))
		}
		next();
	};
};

exports.forgotPassword = catchAsync( async(req, res, next) => {
	//1) get user based on POSTed email
	const user = await User.findOne({ email: req.body.email });
	console.log(user)
	if(!user) {
		return next(new AppError('There is no user with email address.', 404))
	}

	//2) generate the random token 
	const resetToken = user.createPasswordResetToken();
	console.log('resettoken', resetToken);

	//3) Send it to user's email
	console.log('Protocol:', req.protocol);
	console.log('Host:', req.get('host'));
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
	console.log('Reset URL:', resetURL);

	const message = `Forgot your password? Submit a PATCH requests with your new 
	password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
	try{
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message
		});
	
		res.status(200).json({
			status: "success",
			message: "Token sent to email"
		});
	} catch(err) {
		console.error('Error sending email:', err);

		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false }); 

		return next(new AppError('There was an error sendig the email. Try again letter', 500))

	}
	
});

exports.resetPassword = (req, res,next) => {};