const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
	try{
		const tours = await Tour.find();
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours
			}
		})
	} catch (err){
		res.status(404).json({
			status: 'fail',
			message: 'blah'
		})
	}
};

exports.getTour = async (req,res) => {
	try{
		const tour = await Tour.findById(req.params.id);
		if (!tour) {
			return res.status(404).json({
				status: 'fail',
				message: 'Tour not found'
			});
		}
		res.status(200).json({
			status: 'success',
			data: {
				tour
			}
		});
	} catch (err){
		res.status(400).json({
			status: 'fail',
			message: 'Invalid ID'
		});
	}
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
			message: err
		});
	}
};


exports.updateTour = async (req, res) => { 
	try{
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		res.status(200).json({
			status: 'success',
			data: {
				tour //tour: tour
			}
		});
	}catch (err){
		res.status(404).json({
			status: 'fail',
			message: 'blah'
		})
	}
};

exports.deleteTour = async (req, res) => { 
	try{
		const tour = await Tour.findByIdAndDelete(req.params.id);
		res.status(204).json({
			status: 'success',
			data: null
		}) 
		// if (!tour) {
        //     return res.status(404).json({
        //         status: 'fail',
        //         message: 'No tour found with that ID'
        //     });
        // }
	} catch (err){
		res.status(500).json({
            status: 'error',
            message: err.message
        });
	}
};