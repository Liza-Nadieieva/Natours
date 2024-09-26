const fs = require('fs');

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
	console.log(req.requestTime);
	res.status(200).json({
		status: 'success',
		results: tours.length,
		requestAd: req.requestTime,
		data: {
			tours
		}
	})
};

exports.getTour = (req, res) => { //:id? optional
	const id = req.params.id * 1 // trick to convert to number 
	const tour = tours.find(el => el.id === id);
	// if(id > tours.length)
	if(!tour){ //if tour doesnt find 
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	});
};

exports.createTour = (req, res) => {
	const newId = tours[tours.length - 1].id + 1;
	const newTour = Object.assign({id: newId}, req.body); //merging objects

	tours.push(newTour);

	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
		JSON.stringify(tours),
		err => { 
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour //created
			}
		}); 
	});
};

exports.updateTour = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > tours.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Updated tour here ...>'
		}
	})
};

exports.deleteTour = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > tours.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(204).json({
		status: 'success',
		data: null
	}) 
};