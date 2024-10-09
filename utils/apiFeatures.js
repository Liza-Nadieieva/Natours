class APIFeatures {
	constructor(query, queryStr) {
		this.query = query;
		this.queryStr = queryStr;
	}
	filter() {
		const queryObj = { ...this.queryStr }; 
		// 1A. FILTERING Exclude unwanted fields from query parameters
    	const excludedFields = ['page', 'sort', 'limit', 'fields'];
    	excludedFields.forEach(el => delete queryObj[el]);
		// 1B Advanced filtering
    	let queryStr = JSON.stringify(queryObj);
    	queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    	this.query = this.query.find(JSON.parse(queryStr)); // Start with a query object
    	return this;
	}
	sort() {
		if(this.queryStr.sort){
			const sortBy = this.queryStr.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt').allowDiskUse(true); //default by date that was created 
		}
		return this;
	}
	limitFields() {
		if (this.queryStr.fields) {
	        const fields = this.queryStr.fields.split(',').join(' ');
	        this.query = this.query.select(fields); // Chain select
	    } else {
	        this.query = this.query.select('-__v'); // Exclude __v by default if not specified
	    }
	    return this;

	}
	paginate() {
		const page = this.queryStr.page * 1 || 1; //trick to convert to number str * 1 or parseInt
		const limit = parseInt(this.queryStr.limit) || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
};
module.exports = APIFeatures;