const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);
const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if(allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getAllUsers = catchAsync(async (req, res ,next) => {

	const users = await User.find;
	//SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: {
			users
		}
	})
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
	// create error if user post password data
	if(req.body. password || req.body.passwordConfirm){
		return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))
	}
	//filtered out unwanted fields names that are not allowed
	const filteredBody = filterObj(req.body, 'name', 'email');
	//update user document

	const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: "succes",
		data: {
			user: updateUser
		}
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

exports.getUser = (req, res) => {
	// const userId = mongoose.Types.ObjectId(req.params.id);
	const id = req.params.id * 1;

	const user = users.find(el => el.id === id);
	// if(id > tours.length)
	if(!user){ //if tour doesnt find 
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

exports.updateUser = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > users.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

exports.deleteUser = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > users.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};