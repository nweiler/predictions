var api = exports = module.exports = {},
    async = require('async');

// get array of all users
api.get_users = function(db, cb) {
  db.collection('guesses').distinct('name', function(e, d) {
    if (e || d.length == 0) return cb(e, null);
    cb(e, d);
  })
}

// get array of all locations
api.get_locations = function(db, cb) {
  db.collection('guesses').distinct('guesses.city', function(e, d) {
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
            years.sort(function(a, b) { return b - a })
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

// get dates for actual snowfalls
api.get_actuals = function(db, cb) {
  db.collection('actuals').find().toArray(function(e, d) {
    var actuals = [];
    async.each(d,
      function(date, cb1) {
        async.each(date.actuals,
          function(actual, cb2) {
            actuals.push(actual);
            cb2();
          },
          function() {
          cb1();
          }
        )
      },
      function(err) {
        if (e) return cb(e, null);
        cb(e, actuals);
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
      q1 = { 'name': name, 'guesses': { $elemMatch: { 'city': city, 'year': year } } },
      update = { $set: { 'guesses.$.date': new Date(date) } },
      q2 = { 'name': name },
      add = { $addToSet: { 'guesses': { 'city': city, 'year': year, 'date': new Date(date) } } };

  db.collection('guesses').update(
    q1, update, function(e, d) {
      if (d == 0) { // guess doesn't already exist
        db.collection('guesses').update(
          q2, add, function(e, d) {
            //console.log('added new guess');
            res.redirect('/');
            cb(e, d);
          }
        )
      } else {
        //console.log('found record and updated');
        res.redirect('/');
        cb(e, d);
      }
    }
  )
}


// delete_guess
api.delete_guess = function(req, res, db, cb) {
  //console.log(req.body);
  var name = req.body.name.toLowerCase(),
      city = req.body.city,
      date = req.body.date,
      year = req.body.year,
      q = { 'name': name },
      u = { $pull: { 'guesses': { 'city': city, 'year': year } } };

  db.collection('guesses').update(
    q, u,
    function(e, d) {
      res.redirect('/');
      cb(e, d);
    }
  )
}

