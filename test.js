var async = require('async'),
    api = require('./lib/api.js'),
    bodyParser = require('body-parser'),
    express = require('express'),
    app = express(),
    ejs = require('ejs'),
    jade = require('jade'),
    models = require('./lib/models'),
    mongoose = require('mongoose'),
    router = express.Router();
  
mongoose.connect('mongodb://goose_user:user_goose@dogen.mongohq.com:10009/app31863398');
//mongoose.connect('mongodb://localhost/goose');
var db = mongoose.connection;
db.once('open', function callback() {
  
  api.get_all_guesses(db, function(e, years) {
    console.log(years);
  })
})
