const Tour = require('../models/tourModel');
const { populate } = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
	const tours = await Tour.find();
  res.status(200).render('overview', {
		title: 'All Tours',
		tours
	});
});

exports.getTour = catchAsync(async (req, res) => {
	const tour = await Tour.findOne({slug: req.params.slug})
		.populate({
			path: 'reviews',
			fields: 'review rating user'
		});
		console.log(tour)
	res.status(200).render('tour', {
		// title: 'The Forest Hiker Tour',
		tour
	});
});