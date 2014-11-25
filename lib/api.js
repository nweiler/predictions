var api = exports = module.exports = {},
    async = require('async');

  api.get_years = function(req, res, db, cb) {
    db.collection('guesses').distinct('year', function(e, d) {
      if (e || d.length == 0) return cb(e, null);
      cb(e, d);
    })
  }

  api.get_one_guess = function(req, res, db, cb) {
    var name = req.params.name;
    db.collection('guesses').find( { "name": name }).toArray(function(e, d) {
      if (e || d.length == 0) return cb(e, null);
      cb(e, d);
    })
  }

  api.get_all_guesses = function(req, res, db, cb) {
    var name = req.params.name;
    db.collection('guesses').find().toArray(function(e, d) {
      if (e || d.length == 0) return cb(e, null);
      cb(e, d);
    })
  }

  api.update_guess = function(req, res, db, cb) {
    var name = req.params.name;
    db.collection('guesses').update(
      { 'name': name },
      { $set: { 'date': new Date } },
      function(e, results) {
        if (e) {
          cb ? cb(e, null) : console.log('Error updating guess: %s', e);
        } else {
          cb ? cb(e, results) : console.log(results);
        }
    })
  }
  
