const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		trim: true // remove in all strings all the space from the beg and end
	},
	duration: {
		type: Number,
		required: [true, 'A tour must have a duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'A tour must have a group size']
	},
	difficulty: {
		type: String,
		required: [true, 'A tour should have difficulty']
	},
	ratingsAverage: {
		type: Number,
		default: 4.5
	},
	ratingsQuantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price']
	},
	priceDiscount: Number,
	summary: {
		type: String,
		required: [true, 'A tour must have a summary'],
		trim: true // remove in all strings all the space from the beg and end
	},
	description: {
		type: String,
		trim: true
	},
	imageCover: {
		type: String,
		required: [true, 'A tour must have an image']
	},
	images: [String],
	createdAd: {
		type: Date,
		default: Date.now(),
		select: false
	},
	startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
