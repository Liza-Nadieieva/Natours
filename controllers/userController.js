const fs = require('fs');

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.getAllUsers = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

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