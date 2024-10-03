const Tour = require('./../models/tourModel');
// const fs = require('fs');

// const tours = JSON.parse(
// 	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkBody = (req, res, next) => {
// 	// if(!req.body.name || !req.body.price){
// 	// 	return res.status(400).json({
// 	// 		status:'fail',
// 	// 		message:'missing name or price'
// 	// 	})
// 	// }
// 	// next();
// };

exports.createTour =  async (req, res) => {
	try {
		const newTour = await Tour.create(req.body);
		res.status(201).json({
		status: 'success',
			data: {
				tour: newTour //created
			}
		})
	} catch (err){
		res.status(400).json({
			status: 'fail',
			message: 'Invalid data sent!'
		});
	}


exports.updateTour = (req, res) => { 
	// res.status(200).json({
	// 	status: 'success',
	// 	data: {
	// 		tour: '<Updated tour here ...>'
	// 	}
	// })
};

exports.deleteTour = (req, res) => { 
	// res.status(204).json({
	// 	status: 'success',
	// 	data: null
	// }) 
};