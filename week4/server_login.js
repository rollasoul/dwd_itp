// so much to declare ...
var config  = require('./db_config.js');
var mongojs = require('mongojs');
var db = mongojs(config.mlabstring, ["dwd_test"]);
// we are using express
var express = require('express');
var app = express();
var lost = [];
var data = {};
// for parsing form data
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

var session = require('express-session');
var nedbstore = require('nedb-session-store')(session);

app.use(urlencodedParser);
// make express see the world with ejs-eyes
app.set('view engine', 'ejs');

//create static directory for css so that ejs knows where to find it
app.use(express.static(__dirname + '/public'));

// https://github.com/kelektiv/node-uuid
// npm install node-uuid
const uuidV1 = require('uuid/v1');

var allowedUsers = [
	{"username": "roland", "password": "weather"},
	{"username": "root", "password": "password"},
	{"username": "john", "password": "pass"}
];

app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				 maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				},
			store: new nedbstore({
			filename: 'sessions.db'
			})
		}
	)
);

// Main page
app.get('/', function(req, res) {
	if (!req.session.username) {
		res.render('login.ejs', {});
	} else {
		// Give them the main page
  		//res.send('session user-id: ' + req.session.userid + '. ');
		res.render('main.ejs', req.session);
	}
});

app.get('/logout', function(req, res) {
	delete req.session.username;
	res.redirect('/');
});

// Post from login page
app.post('/login', function(req, res) {

	// Check username and password in database
	for (var i = 0; i < allowedUsers.length; i++) {
		if (allowedUsers[i].username == req.body.username &&
		    allowedUsers[i].password == req.body.password) {


			// Found user
			var userRecord = allowedUsers[i];

			// Set the session variable
			req.session.username = userRecord.username;

      var question  = req.body.question;
      console.log(question);
			// Put some other data in there
			req.session.question = question;


			break;
		}
	}

	// Redirect back to main page
	res.redirect('/');

});

// create a starting page/route for user input,
// refer to html file inside 'public '
app.get('/question', function (req, res) {
	var fileToSend = "question.html";
	res.sendFile(fileToSend, {root: './public'});
});

// create a starting page/route for user input for jquery,
// refer to html file inside 'public '
app.get('/simple_jquery', function (req, res) {
	var fileToSend = "simple_jquery.html";
	res.sendFile(fileToSend, {root: './public'});
});

// create a POST-route for the data to be  stored in remote mongodb-file,
// redirect to an output page (probably not really needed - but maybe more transparent?)
app.post('/processit', function(req, res) {
	var textvalue = req.body.textfield;
	db.dwd_test.save({"input":textvalue}, function(err, saved) {
 		if( err || !saved ) console.log("Not saved");
 		else console.log("Saved");
	});
	res.redirect('/meaning');
});

// access the mongodb-file, retrieve the inputs and output to ejs-file
app.get('/meaning', function(req, res) {
        // find all of the existing entries in the remote database
	// store them in data object
	lost = [];
        db.dwd_test.find({}, function(err, saved) {
                for (var i = 0; i < saved.length; i++) {
                        lost.push(" " + saved[i].input);
	        }
		lost = {data: lost};
		res.render('template.ejs', lost);
        });
});
app.get('/search', function(req,res){
	lost = [];
	var query = new RegExp(req.query.q, 'i');
	db.dwd_test.find({input: query}, function(err, saved) {
		console.log(query);
		if( err || !saved) {
			console.log("No results");
		}
    else {
			for (var i = 0; i < saved.length; i++) {
                        	lost.push(" " + saved[i].input);
                	}
			lost = {data: lost};
			res.render("template_search.ejs", lost);
			console.log(lost);
      // Set the session variable
			// Put some other data in there
			//req.session.mewo = lost;
		}
    console.log(lost);
      	});

});



app.listen(3000);
