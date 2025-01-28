const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5}} //gte greater or equal

		},
		{
			$group: {
				_id: { $toUpper:'$difficulty'}, //uppercase
				numTours: { $sum: 1}, //will count every tours
				numRatings: { $sum: '$ratingsQuantity'},
				avgRating: { $avg: '$ratingsAverage'},
				avgPrice: { $avg: '$price'},
				minPrice: { $min: 'price'},
				maxPrice: { $max: 'price'}
			}
		},
		{
			$sort: {
				avgPrice: 1, //from lowest to highest price
			}
		}
		// {
		// 	$match: {
		// 		_id: { $ne: 'EASY'} //not equal
		// 	}
		// }
	])
	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year.slice(1) * 1; //2021

	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates' //deconstruct an array field in a document. 
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`), //less or equal
				}
			}
		},
		{
			$group:{
				_id: { $month: '$startDates' }, //grouping by the month
				numTourStarts: { $sum: 1 },
				tours: { $push: '$name'}
			}
		},
		{
		    $addFields: { month: '$_id' } // Assign the value of _id to 'month'
		},
		{
		    $project: { _id: 0 }  // Optionally, hide the _id field in the result
		},
		{
			$sort: { numTourStarts: -1} //with the highest number
		},
		{
			$limit: 12
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			plan
		}
	});
});

// /tours-within/:distance/center/:latlng/unit/:unit
// tours-within/400/center/34.0522, -118.2437/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng ] = latlng.split(',');
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1 // the last one in case of km
	if(!lat || !lng){
		return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
	};
	// $geoWithin
	const tours = await Tour.find({ 
		startLocation: 
			{ $geoWithin: {$centerSphere : [[lng, lat], radius] } }
	});
	console.log(distance, lat, lng, unit);
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours
		}
	});
});

//'/distances/:latlng/unit/:unit'
// /34.0522,-118.2437/unit/mi

exports.getDistances = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params;
	const [lat, lng ] = latlng.split(',');
	const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;
	if(!lat || !lng){
		return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
	};
	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	])
	res.status(200).json({
		status: 'success',
		data: {
			data: distances
		}
	});
})