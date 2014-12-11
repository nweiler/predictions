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
  
/*
  api.get_users(db, function(e, years) {
    console.log(years);
  })
  
*/
/*
  api.get_years(db, function(e, years) {
    console.log(years);
  })
*/
/*
  api.get_all_guesses(db, function(e, guesses) {
    console.log(guesses);
  })
  api.get_actuals(db, function(e, actuals) {
    actuals.forEach(function(x) {
      console.log('actual: %s', JSON.stringify(x));
    })
  })

api.get_locations(db, function(e, locs) {
  console.log(locs);
})
*/

api.get_winners(db, function(e, winners) {
  console.log(winners);
})

})
