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
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
  
// app setup
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))
app.use(passport.initialize())
app.use(passport.session())
app.use('/', router);


mongoose.connect('mongodb://goose_user:user_goose@dogen.mongohq.com:10009/app31863398');
var db = mongoose.connection;
db.once('open', function callback() {

  passport.use(new LocalStrategy(
    function(username, password, done) {
      db.collection('users').findOne( { 'username': username }, function(e, user) {
        if (e) return done(e);
        if (!user) return done(null, false, { message: 'Incorrect username' });
        return done(null, user);
      })
    }
  ))

  router.get('/',
    passport.authenticate('local'), 
    function(req, res) {

      api.get_years(db, function(e, years) {
        api.get_users(db, function(e, users) {
          api.get_all_guesses(db, function(e, guesses) {
            res.render('index', {
              'title': 'Snow Predictions',
              'users': users,
              'years': years,
              'guesses': guesses
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

