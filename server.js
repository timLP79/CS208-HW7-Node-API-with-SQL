const express = require("express");
const morgan = require("morgan");
const db = require("./db");
const bodyParser = require('body-parser');
const app = express();

// Shows HTTP requests in the console
app.use(morgan("dev"));

// parse application/x-www-form-urlencoded
// this will allow us to access data from a POST request
app.use(bodyParser.urlencoded({ extended: false }))


const PORT = 8080;

// Start the web server
app.listen(PORT, function ()
{
    console.log("Starting the School Management System: Node API Server...");
    console.log("The server will listen on port " + PORT + "...");
    console.log(`The server will listen on port ${PORT}...`); // this is an alternative format
    console.log("In a browser, open the URL:");
    console.log("    http://localhost:8080/classes");
    console.log("to see a list of classes in JSON format.");
});


// Called for GET request at http://localhost:8080/
app.get('/', function (req, res)
{
    console.log('GET / called');
    res.send('<h1>Hello world, the server is running correctly!</h1>');
})


// Called for GET request to http://localhost:8080/hello
app.get("/hello", function (req, res)
{
    res.send("<h1>This is the GET /hello route</h1>");
});


// The routes defined in ./routes/classes.js will be listened by the server
app.use('/', require('./routes/classes'));
app.use('/', require('./routes/students'));
app.use('/', require('./routes/registered_students'));

module.exports = app;
