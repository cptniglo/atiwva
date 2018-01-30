var mysql = require('mysql');

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

function queryDb(resolve) {
	//con.query('SELECT Fach_Kuerzel FROM Fach WHERE Fach_ID = (SELECT Fach_ID FROM Klasse_Zeitpunkt WHERE Zeitpunkt_ID = (SELECT Zeitpunkt_ID FROM Zeitpunkt WHERE Zeitpunkt_Tag = "Montag" AND Zeitpunkt_Block = "1"))', function(err, result, fields) {
	con.query('SELECT * FROM Klasse_Zeitpunkt WHERE Zeitpunkt_ID = "1"', function(err, result, fields) {
		if (err) throw err;
		var str = JSON.stringify(result);
		console.log('>>string: ' + str);
		console.log('>>raw: ' + result);
		console.log('>>prop: ' + result[0].Fach_Kuerzel);
		resolve(result[0].Fach_Kuerzel);
	});
}

var promise = new Promise((resolve, reject) => {
	queryDb(resolve);
});

promise.then((answer) => {
	console.log('>>promise2: ' + answer);
});
