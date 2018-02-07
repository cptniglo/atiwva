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
	if (err) throw err; // Missing exception handling
	console.log('Connected!');
});

// Set default class id
var classId = '1';

const GET_LESSON_AT_TIME_ACTION = 'get_lesson_at_time_action';

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
		ordinal[2] = 'dritten';
		ordinal[3] = 'vierten';
		ordinal[4] = 'fünften';
		ordinal[5] = 'sechsten';
		ordinal[6] = 'siebten';
		ordinal[7] = 'achten';
		ordinal[8] = 'neunten';
		ordinal[9] = 'zehnten';

		return ordinal[num - 1];
	}

	function queryDatabase(sql) {
		return new Promise((resolve, reject) => {
			con.query(sql, (err, result, fields) => {
				if (err) reject(); // Missing rejection catch
				resolve(result);
			});
		});
	}

	// Get lesson at time action handler
	function getLessonAtTime(app) {
		console.log('>>log: getLessonAtTime() fired')
		var date = new Date(app.getArgument('date'));
		var weekday = getWeekday(date);
		var block = parseInt(app.getArgument('block'));
		if (isNaN(block)) {
			console.log('>>log: block is null');
			getLessonsOnDay(app, weekday);
		}
		else {
			console.log('>>log: block is not null');
			getLessonOnDayInBlock(app, weekday, block);
		}
	}

	function getLessonsOnDay(app, weekday) {
		console.log('>>log: fetching lessons...');
		var sql = `SELECT * 
		FROM (SELECT kz1.Klasse_ID, kz1.Zeitpunkt_ID, kz1.Fach_ID, f1.Fach_Bezeichnung 
		FROM Klasse_Zeitpunkt kz1 LEFT JOIN Fach f1 ON kz1.Fach_ID = f1.Fach_ID 
		UNION 
		SELECT kz2.Klasse_ID, kz2.Zeitpunkt_ID, kz2.Fach_ID, f2.Fach_Bezeichnung 
		FROM Klasse_Zeitpunkt kz2 RIGHT JOIN Fach f2 ON kz2.Fach_ID = f2.Fach_ID) kzn 
		WHERE kzn.Klasse_ID = "${classId}" AND kzn.Zeitpunkt_ID IN 
		(SELECT z.Zeitpunkt_ID FROM Zeitpunkt z WHERE z.Zeitpunkt_Tag = "${weekday}") 
		ORDER BY kzn.Zeitpunkt_ID`;
		var promise = queryDatabase(sql);
		promise.then((result) => {
			var lessons = new Array();
			for (var i = 0; i < result.length; i++) {
				lessons.push(result[i].Fach_Bezeichnung);
			}
			var lessonsStr = lessons.join(', ');
			app.data.answer = lessonsStr;
			app.ask('Am ' + weekday + ' habt ihr folgende Fächer: ' + lessonsStr);
		});
	}

	function getLessonOnDayInBlock(app, weekday, block) {
		console.log('>>log: fetching lesson...');
		var sql = `SELECT Fach_Bezeichnung FROM Fach WHERE Fach_ID = 
		(SELECT Fach_ID FROM Klasse_Zeitpunkt WHERE Klasse_ID = "${classId}" AND Zeitpunkt_ID = 
		(SELECT Zeitpunkt_ID FROM Zeitpunkt WHERE Zeitpunkt_Tag = "${weekday}" AND Zeitpunkt_Block = "${block}"))`;
		var promise = queryDatabase(sql);
		promise.then((result) => {
			app.data.answer = result[0].Fach_Bezeichnung;
			app.ask('Am ' + weekday + ' in der ' + getOrdinal(block) + ' Stunde habt ihr ' + result[0].Fach_Bezeichnung);
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
