const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

//1) middlewares
app.use(morgan('dev')); //morgan will return function similar to use 
//it show information on the console about the request we did


app.use(express.json()); //middleware

app.use((req, res, next) => {
	console.log('hello from the middleware');
	next();
});

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString(); // show the exact time of request
	next();
})

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));
const users = JSON.parse(
	fs.readFileSync(`${__dirname}/dev-data/data/users.json`));

//2) Route Handlers
const getAllTours = (req, res) => {
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
const getTour = (req, res) => { //:id? optional
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => { 
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

const deleteTour = (req, res) => { 
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

const getAllUsers = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};
const getUser = (req, res) => {
	const id = req.params.id * 1 // trick to convert to number 
	const user = users.find(el => el.id === id);
	// if(id > tours.length)
	if(!user){ //if tour doesnt find 
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};
const updateUser = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > users.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const deleteUser = (req, res) => { 
	const id = req.params.id * 1 // trick to convert to number 
	if(id > users.length) {
		return res.status(400).json({
			status: 'fail',
			message: 'invalid id'
		})
	}
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};





//ROUTES
// app.get('/api/v1/tours', getAllTours); 
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app
	.route('/api/v1/tours')
	.get(getAllTours)
	.post(createTour);
app
	.route('/api/v1/tours/:id')
	.get(getTour)
	.patch(updateTour)
	.delete(deleteTour);
app
	.route('/api/v1/users')
	.get(getAllUsers)
	.post(createUser);
app
	.route('/api/v1/users/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser);


//4) start server 
const port = 3000;

app.listen(port, () => {
	console.log(`app running port  ${port}`);
});
