const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		trim: true, // remove in all strings all the space from the beg and end
		maxlength: [40, 'A tour name must have less or equal then 40 characters'],
		minlength: [10, 'A tour name must have more or equal then 10 characters'],
		// validate: [validator.isAlpha, 'Tour name must only contain characters']
	},
	slug: String,
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
		required: [true, 'A tour should have difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'difficulty is either: easy, medium or difficult'
		}
	},
	ratingsAverage: {
		type: Number,
		default: 4.5,
		min: [1, 'Rating must be above 1.0'],
		max:[5, 'Rating must be below 5.0'],
		set: val => Math.round(val * 10) / 10
	},
	ratingsQuantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function(value) {
				//this only points to current doc on NEW DOC CREATION
				return value < this.price;
			},
			message: 'Discount price ({VALUE}) should be below regular price'
		}
	},
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
	startDates: [Date],
	secretTour: {
		type: Boolean,
		default: false,
		},
		startLocation: {
			//GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number
			}
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User'
			}		
		]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});



// tourSchema.pre('save', async function(next){
// 	const guidesPromises = this.guides.map(async el => await  User.findById(el));
// 	this.guides = await Promise.all(guidesPromises);
// 	next()
// });
tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});
//virtual populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour', // in review  Schema
	localField: '_id'
});

//document middleware (hooks) : runs before .save and .create
tourSchema.pre('save', function(next) {  
	this.slug = slugify(this.name, { lowe: true });
	next();
});

// tourSchema.post('save', function(doc, next) {
// 	console.log(doc);
// 	next();
// });

//QUERRY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt'
	});
	
	next();
});

tourSchema.pre(/^find/, function(next) {
	//this query 
	this.find({ secretTour: {$ne: true} }); //not equal
	this.start = Date.now();
	next();
});

tourSchema.post(/^find/, function(docs, next) {
	console.log(`Query took ${Date.now() - this.start}`)
	next();
});
// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) { 
// 	this.pipeline().unshift({ $match: { secretTour: {$ne: true } } });
// 	// console.log(this); //pipeline object
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
