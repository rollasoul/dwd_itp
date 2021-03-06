// so much to declare ...
var express = require('express');
var app = express();
var lost = [];
var bodyParser = require('body-parser');
// for parsing form data (needed for POST?)
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlencodedParser);
// make express see the world with ejs-eyes
app.set('view engine', 'ejs');

//create static directory for css so that ejs knows where to find it
app.use(express.static(__dirname + '/public'));

// database to store data from user input
var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

// create a starting page/route for user input,
// refer to html file inside 'public '
app.get('/yo', function (req, res) {
	var fileToSend = "yo.html";
	res.sendFile(fileToSend, {root: './public'});
});

// create a POST-route for the data to be  stored in nedb-file,
// redirect to an output page (probably nopt really needed?)
app.post('/processit', function(req, res) {
	var textvalue = req.body.textfield;
	var datatosave = {
		name: textvalue}
		db.insert(datatosave, function (err, newDocs) {
			console.log("err: " + err);
			console.log("newDocs: " + newDocs);
		});
	res.redirect('/templatetest');
});

// access the nedb-file, retrieve the inputs and output to ejs-file
app.get('/templatetest', function(req, res) {
        // Find all of the existing docs in the database
	var data = "";
	lost = [];
       db.find({}, function(err, docs) {
                for (var i = 0; i < docs.length; i++) {
                        lost.push(" " + docs[i].name);
	        }
		console.log(lost);
		data = {person: {name: lost}};
		res.render('template.ejs', data);
        });
});

// we're live on port 3000
app.listen(3000);

