var api = exports = module.exports = {},
    async = require('async');

// get array of all users
api.get_users = function(db, cb) {
  db.collection('guesses').distinct('name', function(e, d) {
    if (e || d.length == 0) return cb(e, null);
    cb(e, d);
  })
}


// get array of all years
api.get_years = function(db, cb) {
  db.collection('guesses').find().toArray(function(e, d) {
    var years = [],
        years_obj = {};
    async.each(d, 
      function(user, cb1) {
        async.each(user.guesses,
          function(guess, cb2) {
            years_obj[guess.year] = true;
            cb2();
            },
          function(err) {
            cb1();
          }
        )
      },
      function(err) {
        if (e || d.length == 0) return cb(e, null);
        async.each(Object.keys(years_obj),
          function(yr, cb) {
            years.push(yr);
            cb();
          },
          function(err) {
            cb(e, years);
          }
        )
      }
    )
  })
}


// get all guesses for all users
api.get_all_guesses = function(db, cb) {
  db.collection('guesses').find().toArray(function(e, d) {
    var guesses = [];
    async.each(d,
      function(user, cb1) {
        async.each(user.guesses,
          function(guess, cb2) {
            guess.name = user.name;
            guesses.push(guess);
            cb2();
          },
          function(err) {
            if (e || d.length == 0) return cb(e, null);
            cb1();
          }
        )
      },
      function(err) {
        if (e || d.length == 0) return cb(e, null);
        cb(e, guesses);
      }
    )
  })
}


// create guess or update existing
api.upsert_guess = function(req, res, db, cb) {
  var name = req.body.name.toLowerCase(),
      city = req.body.city,
      year = req.body.year,
      date = req.body.date,
      q1 = { 'name': name, 'guesses.city': city, 'guesses.year': year },
      update = { $set: { 'guesses.$.date': new Date(date) } },
      q2 = { 'name': name },
      add = { $push: { 'guesses': { 'city': city, 'year': year, 'date': new Date(date) } } },
      opts = { 'upsert': true };

  db.collection('guesses').update(
    q1, update, opts, function(e, d) {
      if (e && e.code == '16650') { // guess doesn't already exist
        db.collection('guesses').update(
          q2, add, opts, function(e, d) {
            console.log('no guess found');
            res.redirect('/');
            cb(e, d);
        })
      } else {
        console.log(e, d);
        console.log('update okay');
        res.redirect('/');
        cb(e, d);
      }
    }
  )
}


// delete_guess
api.delete_guess = function(req, res, db, cb) {
  console.log(req.body);
  var name = req.body.name.toLowerCase(),
      city = req.body.city,
      date = req.body.date,
      year = req.body.year,
      q = { 'name': name },
      opts = { $pull: { 'guesses': { } } };

  db.collection('guesses').update(
    q, u, opts,
    function(e, d) {
      res.redirect('/');
      cb(e, d);
    }
  )
}

