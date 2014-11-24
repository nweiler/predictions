var async = require('async'),
    api = require('./lib/api.js'),
    express = require('express'),
    app = express(),
    ejs = require('ejs'),
    jade = require('jade'),
    models = require('./lib/models'),
    mongoose = require('mongoose'),
    router = express.Router();
  
// app setup
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use('/', router);
app.use(express.static(__dirname + '/public'))
  
mongoose.connect('mongodb://goose_user:user_goose@dogen.mongohq.com:10009/app31863398');
//mongoose.connect('mongodb://localhost/goose');
var db = mongoose.connection;
db.once('open', function callback() {
  
  router.get('/', function(req, res) {
    api.get_all_guesses(req, res, db, function(e, d) {
      res.render('index', {
        'title': 'Snow Predictions',
        'guesses': d
      })
    })
  })

  router.get('/api/guesses/:name', function(req, res) {
    api.get_one_guess(req, res, db, function(e, d) {
      res.render('index', {
        'result': d
      })
    })
  });
  
  router.post('/api/guesses/:name', function(req, res) {
    api.update_guess(req, res, db);
  });

  app.listen(app.get('port'), function() {
    console.log('Server running at http://localhost:' + app.get('port'));
  })
})

