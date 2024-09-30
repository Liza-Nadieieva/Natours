const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//connecting to db
//db as url
mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindandModify: false
}).then(() => console.log('db connecton successul'));

const port = process.env.PORT || 3000;
``;
// Define a route for the root URL
app.get("/", (req, res) => {
	res.send("Hello, World!"); // Response for the root path
});

app.listen(port, () => {
	console.log(`app running port at ${port}`);
});
