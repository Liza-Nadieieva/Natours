const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');


dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE
    .replace('<USERNAME>', process.env.USER_NAME)
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
.then(con => {
	console.log('DB conncection successful!');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

//Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


//import data into db
const importData = async () => {
	try{
		await Tour.create(tours);
		await User.create(users); // {validateBeforeSave: false} turn off validation
		await Review.create(reviews);
		console.log('loaded');
		process.exit(); //agressive way of stopping app
	} catch (err){
		console.log(err);
	}
};
// importData()
//delete all data from collections

const deleteData = async () => {
	try{
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();

		console.log('deleted');
		process.exit(); //agressive way of stopping app
	} catch (err){
		console.log(err)
	}
};
if(process.argv[2] === '--import'){
	importData();
} else if (process.argv[2] === '--delete'){
	deleteData();
};







