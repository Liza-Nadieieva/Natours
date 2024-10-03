const mongoose = require('mongoose');
const dotenv = require("dotenv");

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


const app = require("./app");

const port = process.env.PORT || 3000
// Define a route for the root URL
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
	res.send("Hello, World!"); // Response for the root path
});

app.listen(port, () => {
	console.log(`app running port at ${port}`);
});
