const mongoose = require('mongoose');
const dotenv = require("dotenv");

// process.on('uncaughtException', err => {
// 	console.log(err.name, err.message);
// 	console.log('UNCAUGHT EXCEPTION Shutiting down..');
// 	process.exit(1); 
// });

dotenv.config({ path: "./config.env" });


const DB = process.env.DATABASE
    .replace('<USERNAME>', process.env.USER_NAME)
    .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
	.connect(DB)
	.then(con => {
		console.log('DB conncection successful!');
	})
	.catch((error) => {
    	console.error('Error connecting to MongoDB:', error);
	});


const app = require("./app");

// Define a route for the root URL
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("Hello, World!"); // Response for the root path
});

const server = app.listen(port, () => {
	console.log(`app running port at ${port}`);
});

//rather than cath block where mongoose
process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('UNHANDLER REJECTION Shutiting down..');
	server.close(()=> {
		process.exit(1); 
		// Exit immediately
		// process.kill(process.pid, 'SIGTERM');
	});
});



