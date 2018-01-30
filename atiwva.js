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
	host: '192.168.2.32',
	user: 'db_1',
	password: 'passwort',
	database: 'smatiw1'
});

con.connect(function(err) {
	if (err) throw err;
	console.log('Connected!');
});

var classId = '1';

const GET_LESSON_AT_TIME_ACTION = 'get_lesson_at_time';

app.post('/', function (request, response) {
	console.log('headers: ' + JSON.stringify(request.headers));
	console.log('body: ' + JSON.stringify(request.body));

	const app = new App({request: request, response: response});

	function getWeekday(date) {
		var weekday = new Array(7);
		weekday[0] = 'Sonntag';
		weekday[1] = 'Montag';
		weekday[2] = 'Dienstag';
		weekday[3] = 'Mittwoch';
		weekday[4] = 'Donnerstag';
		weekday[5] = 'Freitag';
		weekday[6] = 'Samstag';
	
		return weekday[date.getDay()];
	}

	function queryLessonsAtTime(resolve, weekday, block) {
		con.query(`SELECT Fach_Kuerzel FROM Fach WHERE Fach_ID = (SELECT Fach_ID FROM Klasse_Zeitpunkt WHERE Klasse_ID = "${classId}" AND Zeitpunkt_ID = (SELECT Zeitpunkt_ID FROM Zeitpunkt WHERE Zeitpunkt_Tag = "${weekday}" AND Zeitpunkt_Block = "${block}"))`, function (err, result, fields) {
			if (err) throw err;
			let resVal = result[0].Fach_Kuerzel;	
			console.log('Das Ergebnis ist: ' + resVal);
			resolve(resVal);
		});
	}

	function getLessonAtTime(app) {
		console.log('Fetching lessons...');
		let date = new Date(app.getArgument('date'));
		let weekday = getWeekday(date);
		let hour = parseInt(app.getArgument('hour'));
		var answer = new Promise((resolve, rejecet) => {
			queryLessonsAtTime(resolve, weekday, hour);
		});
		answer.then((value) => {
			app.data.answer = value;
			app.ask('Die Antwort ist ' + value);
		});
	}

	let actionMap = new Map();
	actionMap.set(GET_LESSON_AT_TIME_ACTION, getLessonAtTime);

	app.handleRequest(actionMap);
});

// Start the server
var server = app.listen(app.get('port'), function() {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});
