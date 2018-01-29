'use strict'

// Enable actions client library debugging
process.env.DEBUG = 'actions-on-google'

let App = require('actions-on-google').DialogflowApp;
let express = require('express');
var mysql = require('mysql');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(express.json({type: 'application/json'}));

var con = mysql.createConnection({
	host: "192.168.2.32",
	user: "db_1",
	password: "passwort"
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

const GET_LESSON_AT_TIME_ACTION = 'get_lesson_at_time';

app.post('/', function (request, response) {
	console.log('headers: ' + JSON.stringify(request.headers));
	console.log('body: ' + JSON.stringify(request.body));

	const app = new App({request: request, response: response});

	function squareNumber(num) {
		return Math.pow(num, 2);
	}

	function queryLessonsAtTime(date, hour) {

	}

	function getLessonAtTime(app) {
		console.log('Fetching lessons...');
		let number = parseInt(app.getArgument('number'));
		var answer = squareNumber(number);
		app.data.answer = answer;
		app.ask('Die Antwort ist ' + answer);
	}

	let actionMap = new Map();
	actionMap.set(SQUARE_NUMBER_ACTION, test);

	app.handleRequest(actionMap);
});

// Start the server
var server = app.listen(app.get('port'), function() {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});