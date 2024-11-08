const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

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


exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

exports.getUser = (req, res) => {
	const id = req.params.id * 1 // trick to convert to number 
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