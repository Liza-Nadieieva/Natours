const express = require('express');
const { getAllTours,
		createTour,
		getTour,
		updateTour,
		deleteTour,
		checkId,
		checkBody 
	} = require('../controllers/tourController');
const router = express.Router(); //middleware

//Middleware function
router.param('id', checkId);

//create a checkBody middleware
//check if body containes the name and price property
//if not, send back  400 (bad request)
//add it to the post handler stack


router
	.route('/')
	.get(getAllTours)
	.post(checkBody, createTour); //add here before add tour 

router
	.route('/:id') //param
	.get(getTour)
	.patch(updateTour)
	.delete(deleteTour);

module.exports = router;
