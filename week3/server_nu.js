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
app.use(urlencodedParser);
// make express see the world with ejs-eyes
app.set('view engine', 'ejs');

//create static directory for css so that ejs knows where to find it
app.use(express.static(__dirname + '/public'));

// create a starting page/route for user input,
// refer to html file inside 'public '
app.get('/question', function (req, res) {
	var fileToSend = "question.html";
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

// we're live on port 3000
app.listen(3000);

