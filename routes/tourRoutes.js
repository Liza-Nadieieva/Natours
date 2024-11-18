const express = require('express');
const { getAllTours,
		createTour,
		getTour,
		updateTour,
		deleteTour,
		checkId,
		aliasTopTours,
		getTourStats,
		getMonthlyPlan
	} = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const router = express.Router(); //middleware

//Middleware function
// router.param('id', checkId);

//create a checkBody middleware
//check if body containes the name and price property
//if not, send back  400 (bad request)
//add it to the post handler stack
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
	.route('/')
	.get(authController.protect, getAllTours)
	.post(createTour); //add here before add tour 

router
	.route('/:id') //param
	.get(getTour)
	.patch(updateTour)
	.delete(deleteTour);

module.exports = router;
