const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { authenticator, totp } = require('otplib');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const MAX_ATTEMPTS = 5; // Maximum number of login attempts allowed
const LOCK_TIME = 15 * 60 * 1000; // Lock duration in milliseconds (15 minutes)

exports.checkLock = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // Check if the account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingLockTime = (user.lockUntil - Date.now()) / 1000; // in seconds
    return next(
      new AppError(
        `Account is locked. Try again in ${Math.ceil(remainingLockTime)} seconds.`,
        403
      )
    );
  }

  // Reset loginAttempts and lockUntil if lock period has passed
  if (user.lockUntil && user.lockUntil <= Date.now()) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  next();
});
  

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '1h'
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOption = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true
	};
	if (process.env.NODE_ENV === 'production') cookieOption.secure = true; // Only send cookie over HTTPS in production

	res.cookie('jwt', token, cookieOption);
	//remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
};

const verifyTotpCode = (totpCode, totpSecret) => {
	try {
	  console.log('Expected TOTP (server-side):', authenticator.generate(totpSecret));
	  console.log('Received TOTP (client-side):', totpCode);
  
	  const isValid = authenticator.verify({
		token: totpCode,
		secret: totpSecret,
		window: 1, 
	  });
	  console.log(`Verification result: ${isValid}`);
	  return isValid;
	} catch (error) {
	  console.error('Error verifying TOTP code:', error);
	  return false;
	}
  };

  exports.verify2FA = catchAsync(async (req, res, next) => {
	const { tempToken, totpCode } = req.body;

	// 1) Check if both the temporary token and 2FA code are provided
	if (!tempToken || !totpCode) {
	  return next(new AppError('Please provide both temporary token and 2FA code', 400));
	}
  
	//2) verify the temporary JWT
	const decoded = await promisify(jwt.verify)(tempToken, process.env.JWT_SECRET);
  
	if (!decoded) {
	  return next(new AppError('Invalid or expired token. Please log in again.', 401));
	}
  
	//3) find the user based on the decoded token's payload
	const user = await User.findById(decoded.id);
  
	if (!user || !user.twoFactorEnabled || !user.totpSecret) {
	  return next(new AppError('User not found or 2FA not enabled', 404));
	}
  
	console.log('User found:', user);
	console.log('Stored TOTP Secret:', user.totpSecret);
  
	// 4) verify the TOTP code using otplib
	const isValid = verifyTotpCode(totpCode, user.totpSecret);
  
	if (!isValid) {
	  return next(new AppError('Invalid TOTP code', 401));
	}
  
	createSendToken(user, 200, res);
  });

exports.signup = catchAsync(async (req, res, next) => {
	let totpSecret = null;
	if (req.body.twoFactorEnabled) {
		// // Generate a new secret for 2FA
		// totpSecret = 'GV5SGAQDEZCVWMTD'; //manual
		totpSecret = authenticator.generateSecret();
		const totpCode = authenticator.generate(totpSecret);
		console.log('Generated TOTP Secret:', totpSecret);
		console.log('Generated TOTP Code (for testing):', totpCode);
	}
	const newUser = await User.create({
       ...req.body,
	   twoFactorEnabled: req.body.twoFactorEnabled,
	   totpSecret,
    });; //User.save updating
	
	// const newUser = await User.create({
	// 	name: req.body.name,
	// 	email: req.body.email,
	// 	password: req.body.password,
	// 	passwordConfirm: req.body.passwordConfirm
	// })
	
	// If the user enabled 2FA, generate the secret
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

  
	// 1) Check if email and password are provided
	if (!email || !password) {
	  return next(new AppError('Please provide email and password', 400));
	}
  
	// 2) Retrieve user and check password
	const user = await User.findOne({ email }).select('+password'); // Explicitly include password for comparison

	// Check if user exists
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401)); // You can customize this message
	}
	 // 3) If 2FA is enabled, issue a temporary token for 2FA verification
	if (user.twoFactorEnabled) {
        // 3A) Issue a temporary JWT (short-lived) for 2FA verification
        const tempToken = jwt.sign(
            { id: user._id }, // Payload contains user ID
            process.env.JWT_SECRET, // Secret key
            { expiresIn: '5m' } // Short expiration for security
        );

        // 3B) Respond with the temporary token for 2FA verification
        return res.status(200).json({
            message: '2FA required. Please verify using your authenticator app.',
            tempToken, // Send this tempToken for the user to verify 2FA
    	});
	}
	// 4) If 2FA is not enabled, issue a full session JWT
	createSendToken(user, 200, res);
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
	// const verifyAsync = promisify(jwt.verify);
	// const decoded = await verifyAsync(token, process.env.JWT_SECRET);
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

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
	if(!user) {
		return next(new AppError('There is no user with email address.', 404))
	}

	//2) generate the random reset token 
	const resetToken = user.createPasswordResetToken();
	console.log('resettoken', resetToken);
	await user.save({ validateBeforeSave: false });

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

exports.resetPassword = catchAsync(async (req, res, next) => {
	// get user based on the token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({ 
		passwordResetToken: hashedToken,
		passwordResetExpires: {$gt: Date.now()} 
	});

	console.log('user', user);

	if(!user){
		return next(new AppError('Token is invalid or has expired', 400))
	}
	// if token has not expired, and ther is user, set the new password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	//update changepasswordat property for the user

	// log the user in, send jwt
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// get user from collection 
	const user = await User.findById(req.user.id).select('+password'); 
	// check if posted password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
		return  next(new AppError('Your current password is wrong', 401))
	} 
	//update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();  

	//log user in, send jwt
	createSendToken(user, 200, res);
});