// Grocery Store App

// app.js -- Entry point for the server!

// ********** Loading all the modules required **************************
//azemach

// All the Web Part
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// Other Libs
var path = require('path');

// The Oracle Database Library
var oracledb = require('oracledb');

// ********************* Let's set it all up *************************

// DB Configuration to get JSON format back
oracledb.outFormat = oracledb.OBJECT;

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
	secret: "myAppSecret",
	resave: true,
	saveUninitialized: true
}));

// Setting up ejs templating engine
app.set('view engine', 'ejs');

var routes = require('./routes/routes.js')(app, oracledb);

app.listen(3000, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Server Started on Port 3000");
	}
}); 