var async = require('async'),
    api = require('./lib/api.js'),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    express = require('express'),
    app = express(),
    ejs = require('ejs'),
    jade = require('jade'),
    models = require('./lib/models'),
    mongoose = require('mongoose'),
    router = express.Router(),
    LocalStrategy = require('passport-local').Strategy;
  
// app setup
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))
app.use('/', router);


mongoose.connect('mongodb://goose_user:user_goose@dogen.mongohq.com:10009/app31863398');
var db = mongoose.connection;
db.once('open', function callback() {

  router.get('/',
    function(req, res) {

      api.get_years(db, function(e, years) {
        api.get_users(db, function(e, users) {
          api.get_all_guesses(db, function(e, guesses) {
            api.get_actuals(db, function(e, actuals) {
              res.render('index', {
                'title': 'Snow Predictions',
                'users': users,
                'years': years,
                'guesses': guesses,
                'actuals': actuals
              })
            })
          })
        })
      })
    })

  router.post('/upsert_guess', function(req, res) {
    api.upsert_guess(req, res, db, _cb)
  })
  
  router.post('/delete_guess', function(req, res) {
    api.delete_guess(req, res, db, _cb)
  })

  app.listen(app.get('port'), function() {
    console.log('Server running at http://localhost:' + app.get('port'));
  })
})

// ==== UTILS ==== //
function _cb(e, d) {
  if (e) { console.log('Error: %s', e); }
  else { console.log('Data: %s', JSON.stringify(d)); }
}

