const express = require('express');
const { getAllTours,
		createTour,
		getTour,
		updateTour,
		deleteTour,
		checkId,
		aliasTopTours,
		getTourStats,
		getMonthlyPlan,
		getToursWithin,
		getDistances
	} = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router(); //middleware

//Middleware function
// router.param('id', checkId);

//create a checkBody middleware
//check if body containes the name and price property
//if not, send back  400 (bad request)
//add it to the post handler stack
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// router
// 	.route('/:tourId/reviews')
// 	.post(authController.protect, authController.restrictTo('user'), reviewController.createReview)
router.use('/:tourId/reviews', reviewRouter);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin); //coordinates of the place where you are
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
	.route('/')
	.get(getAllTours)
	.post(authController.protect, authController.restrictTo('admin', 'lead-guide'), createTour); //add here before add tour 

router
	.route('/:id') //param
	.get(getTour)
	.patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), updateTour)
	.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
