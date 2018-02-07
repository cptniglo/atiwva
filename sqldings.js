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

function queryDb() {
	return new Promise((resolve, reject) => {
	//	con.query('SELECT * FROM Fach WHERE Fach_ID IN (SELECT Fach_ID FROM Klasse_Zeitpunkt WHERE Klasse_ID = "1" AND Zeitpunkt_ID IN (SELECT Zeitpunkt_ID FROM Zeitpunkt WHERE Zeitpunkt_Tag = "Donnerstag"))', function(err, result, fields) {
		con.query('SELECT * FROM (SELECT kz1.Klasse_ID, kz1.Zeitpunkt_ID, kz1.Fach_ID, f1.Fach_Bezeichnung FROM Klasse_Zeitpunkt kz1 LEFT JOIN Fach f1 ON kz1.Fach_ID = f1.Fach_ID UNION SELECT kz2.Klasse_ID, kz2.Zeitpunkt_ID, kz2.Fach_ID, f2.Fach_Bezeichnung FROM Klasse_Zeitpunkt kz2 RIGHT JOIN Fach f2 ON kz2.Fach_ID = f2.Fach_ID) kzn WHERE kzn.Klasse_ID = "1" AND kzn.Zeitpunkt_ID IN (SELECT z.Zeitpunkt_ID FROM Zeitpunkt z WHERE z.Zeitpunkt_Tag = "Donnerstag") ORDER BY kzn.Zeitpunkt_ID', function(err, result, fields) {
			if (err) throw err;
			resolve(result);
		});
	});
}

var promise = queryDb();

promise.then((result) => {
	console.log('>>promise:');
	//var jsonStr = JSON.stringify(answer);
	//var jsonObj = JSON.parse(jsonStr);
	//console.log(jsonObj.Fach_Kuerzel);
	//var lessons = new Array();
	//for (var i = jsonObj.length - 1; i >= 0; i--) {
	//	lessons.push(jsonObj[i].Fach_Bezeichnung);
	//}
	//var lessonsStr = lessons.join(', ');
	console.log(result);
	console.log('success');
});
