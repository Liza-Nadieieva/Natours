const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
	}
});

userSchema.pre('save', async function(next) {
	//only run if password was modified 
	if(!this.isModified('password')) return next();

	//hashing with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	//delete passwordConfirm field
	this.passwordConfirm = undefined;
	next();
})
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
	return await  bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

