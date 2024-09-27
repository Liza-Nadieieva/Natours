const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 3000;
``;
// Define a route for the root URL
app.get("/", (req, res) => {
	res.send("Hello, World!"); // Response for the root path
});

app.listen(port, () => {
	console.log(`app running port at ${port}`);
});
