// const moment = require('moment');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const totp = require('otplib');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide your name'],
	},
	email:{
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: String,
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false //never show in output
	},
	loginAttempts: { type: Number, default: 0 },
  	lockUntil: { type: Number, default: 0 }, // Timestamp for lockout duration
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			//this only works on Create and Save //post and patch
			// validator: function(el) {
			// 	return el === this.password; //boolean
			// },
			validator: function (el) {
				return this.isModified('password') ? el === this.password : true;
			},
			message: 'Passwords are not the same'
		}
	},
	passwordChangeAt: {
	    type: Date
    },
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false
	},
	twoFactorEnabled: { type: Boolean, default: false },
	totpSecret: {
		type: String, 
	},
});

//before
userSchema.pre(/^find/, function(next){
	//this points to the current query
	this.find({ active: {$ne: false} }); //all user who not false 
	next();
});

userSchema.pre('save', function(next) {
	if (!this.loginAttempts) {
	  this.loginAttempts = 0;  
	}
	next();
  });

userSchema.pre('save', async function(next) {
	//only run if password was modified 
	if(!this.isModified('password')) return next();
	//hashing with cost of 12
	this.password = await bcrypt.hash(this.password, 12);
  	//delete passwordConfirm field
	this.passwordConfirm = undefined;
	console.log('After removing passwordConfirm:', this); // Убедитесь, что passwordConfirm удалено

	next();
});

userSchema.pre('save', async function(next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangeAt = Date.now() - 1000;
	next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
	console.log('Candidate password:', candidatePassword);
	console.log('User password (hashed):', userPassword);
	return await  bcrypt.compare(candidatePassword, userPassword);
};

// Check if the password was changed after the JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangeAt) {
		const passwordChangedAt = parseInt(this.passwordChangeAt.getTime() / 1000, 10);  // Convert to seconds
		console.log('Password changed at:', passwordChangedAt, 'JWT timestamp:', JWTTimestamp);
		return JWTTimestamp < passwordChangedAt;  // Return true if password changed after JWT issued
	}

	// If no password change, return false
	return false;
};

// userSchema.methods.toJSON = function () {
//   	const user = this.toObject();
//   	// Format the passwordChangeAt date when returning it to the client (optional)
//   	if (user.passwordChangeAt) {
// 		user.passwordChangeAt = moment(user.passwordChangeAt).format('YYYY-MM-DD');
// 	}
// 	return user;
// };

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex'); 

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
		console.log({resetToken}, this.passwordResetToken);

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

// const updateAllPasswords = async () => {
// 	try {
// 	  // new password
// 	  const newPassword = '*****'; 
  
// 	  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
// 	  const result = await User.updateMany(
// 		{},
// 		{ $set: { password: hashedPassword } }
// 	  );
  
// 	  console.log('alldone', result);
// 	} catch (error) {
// 	  console.error('errors', error);
// 	}
//   };
  
//   updateAllPasswords();

const User = mongoose.model('User', userSchema);
module.exports = User;

