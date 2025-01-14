const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');


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

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
	// create error if user post password data
	if(req.body. password || req.body.passwordConfirm){
		return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))
	}
	//filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');
	//update user document

	const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: "success",
		data: {
			user: updateUser
		}
	});
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({
		status: "success",
		data: null
	})
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined. please use /signup instead'
	});
};

// exports.getUser = (req, res) => {
// 	// const userId = mongoose.Types.ObjectId(req.params.id);
// 	const id = req.params.id * 1;

// 	const user = users.find(el => el.id === id);
// 	// if(id > tours.length)
// 	if(!user){ //if tour doesnt find 
// 		return res.status(400).json({
// 			status: 'fail',
// 			message: 'invalid id'
// 		})
// 	}
// 	res.status(500).json({
// 		status: 'error',
// 		message: 'This route is not yet defined'
// 	});
// };
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req, res) => { 
// 	const id = req.params.id * 1 // trick to convert to number 
// 	if(id > users.length) {
// 		return res.status(400).json({
// 			status: 'fail',
// 			message: 'invalid id'
// 		})
// 	}
// 	res.status(500).json({
// 		status: 'error',
// 		message: 'This route is not yet defined'
// 	});
// };