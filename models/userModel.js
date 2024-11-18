const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');  


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
		validate: [validator.isEmail, 'Please provide a valid name']
	},
	photo: String,
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false //never show in output
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			//this only works on Create and Save //post and patch
			validator: function(el) {
				return el === this.password; //boolean
			},
			message: 'Passwords are not the same'
		}
	},
	passwordChangeAt: {
	    type: Date,
	    set: function(value) {
			// If a string is provided, parse it into a date using moment
			if (typeof value === 'string') {
			return moment(value, 'YYYY-MM-DD').toDate(); // Parse 'YYYY-MM-DD' format and convert to a Date object
			}
			return value; // If it's already a Date, return it as is
		}
    }
});

userSchema.pre('save', async function(next) {
	//only run if password was modified 
	if(!this.isModified('password')) return next();

	//hashing with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	

	// If no passwordChangeAt provided, use the current time
	// if (!this.passwordChangeAt) {
    // this.passwordChangeAt = Date.now(); 
  	// }
  	
  	//delete passwordConfirm field
	this.passwordConfirm = undefined;


	next();
})
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
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

userSchema.methods.toJSON = function () {
  	const user = this.toObject();
  	// Format the passwordChangeAt date when returning it to the client (optional)
  	if (user.passwordChangeAt) {
		user.passwordChangeAt = moment(user.passwordChangeAt).format('YYYY-MM-DD');
	}
	return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

