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

	function getOrdinal(num) {
		var ordinal = new Array(10);
		ordinal[0] = 'ersten';
		ordinal[1] = 'zweiten';
		ordinal[2] = 'ditten';
		ordinal[3] = 'vierten';
		ordinal[4] = 'fünften';
		ordinal[5] = 'sechsten';
		ordinal[6] = 'siebten';
		ordinal[7] = 'achten';
		ordinal[8] = 'neunten';
		ordinal[9] = 'zehnten';

		return ordinal[num - 1];
	}

	function queryDatabase(sql, resolve, reject) {
		con.query(sql, (err, result, fields) => {
			if (err) reject();
			resolve(result);
		});
	}

	// Get lessons at time
	function getLessonAtTime(app) {
		console.log('Fetching lessons...');
		let date = new Date(app.getArgument('date'));
		let weekday = getWeekday(date);
		let block = parseInt(app.getArgument('hour'));
		let sql = `SELECT Fach_Kuerzel FROM Fach WHERE Fach_ID = 
		(SELECT Fach_ID FROM Klasse_Zeitpunkt WHERE Klasse_ID = "${classId}" AND Zeitpunkt_ID = 
		(SELECT Zeitpunkt_ID FROM Zeitpunkt WHERE Zeitpunkt_Tag = "${weekday}" AND Zeitpunkt_Block = "${block}"))`;
		var answer = new Promise((resolve, rejecet) => {
			queryDatabase(sql, resolve, reject);
		});
		answer.then((result) => {
			let resVal = result[0].Fach_Kuerzel
			app.data.answer = resVal;
			app.ask('Am ' + weekday + ' in der ' + getOrdinal(block) + ' Stunde habt ihr ' + resVal);
		});
	}

	let actionMap = new Map();
	actionMap.set(GET_LESSON_AT_TIME_ACTION, getLessonAtTime);

	app.handleRequest(actionMap);
});

// Start the server
var server = app.listen(app.get('port'), () => {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});
