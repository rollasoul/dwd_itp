var express = require('express');
var app = express();
var session = require('express-session');
var nedbstore = require('nedb-session-store')(session);

// https://github.com/kelektiv/node-uuid
// npm install uuid
const uuidV1 = require('uuid/v1');
var visits = 0;
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

app.get('/sessions', function(req, res) {
  if (!req.session.userid) {
  	req.session.userid = uuidV1();
    res.send('You are user ' + req.session.userid + '. So good to see you here - we are delighted!');
  }
  if (req.session.userid){
  		visits = Number(req.session.visits) + 1;
      res.send("So good to see you here again, user " + req.session.userid + " - have fun!");
  }
});

app.listen(3000);
