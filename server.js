const app = require('./app');

const port = 3000;

// Define a route for the root URL
app.get('/', (req, res) => {
    res.send('Hello, World!'); // Response for the root path
});

app.listen(port, () => {
	console.log(`app running port at ${port}`);
});

