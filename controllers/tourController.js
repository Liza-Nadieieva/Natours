const Tour = require('./../models/tourModel');
// const fs = require('fs');

// const tours = JSON.parse(
// 	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.checkId = (req, res, next, val) => {
	// console.log(`req.params : ${req.params.id}`);
	// if(req.params.id * 1 > tours.length) {
	// 	return res.status(404).json({
	// 		status: 'fail',
	// 		message: 'invalid id'
	// 	});
	// }
	// next();
}; 

// exports.checkBody = (req, res, next) => {
// 	// if(!req.body.name || !req.body.price){
// 	// 	return res.status(400).json({
// 	// 		status:'fail',
// 	// 		message:'missing name or price'
// 	// 	})
// 	// }
// 	// next();
// };

exports.getAllTours = (req, res) => {
	// res.status(200).json({
	// 	status: 'success',
	// 	results: tours.length,
	// 	requestAd: req.requestTime,
	// 	data: {
	// 		tours
	// 	}
	// })
};

exports.getTour = (req, res) => { //:id? optional
	// const id = req.params.id;
	// const tour = tours.find(el => el.id === id);
	// res.status(200).json({
	// 	status: 'success',
	// 	data: {
	// 		tour
	// 	}
	// });
};

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
};

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