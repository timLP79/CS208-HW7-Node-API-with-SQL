const app = require('./app');

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
