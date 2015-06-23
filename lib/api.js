var api = exports = module.exports = {},
    async = require('async');

api.get_winners = function(db, cb) {
  winners = [];
  api.get_years(db, function(e, years) {
    api.get_cities(db, function(e, cities) {
      api.get_users(db, function(e, users) {
        api.get_all_guesses(db, function(e, guesses) {
          api.get_actuals(db, function(e, actuals) {
            async.each(years,
              function(year, cb1) {
                async.each(cities,
                  function(city, cb2) {
                    var winner;
                    async.each(guesses,
                      function(guess, cb3) {
                        async.each(actuals,
                          function(actual, cb4) {
                            var diff;
                            if (guess.year == year && guess.city == city && actual.city == city && actual.year == year) {
                              diff = Math.round(Math.abs((actual.date - guess.date) / (1000 * 60 * 60 * 24)))
                              if (winner == undefined || diff < winner.diff) {
                                winner = { 'city': actual.city, 'year': actual.year, 'name': guess.name, 'diff': diff }
                              }
                            }
                            cb4();
                          },
                          function() { cb3(); }
                        )
                      },
                      function() {
                        winners.push(winner);
                        cb2();
                      }
                    )
                  },
                  function() { cb1(); }
                )
              },
              function() {
                cb(e, winners);
              }
            )
          })
        })
      })
    })
  })
}

api.get_user = function(db, user, cb) {
  db.collection('guesses').find(user, function(e, d) {
    if (e || d == undefined) return cb(e, null);
    cb(e, d);
  })
}

// get array of all users
api.get_users = function(db, cb) {
  db.collection('guesses').distinct('name', function(e, d) {
    if (e || d.length == 0) return cb(e, null);
    cb(e, d);
  })
}

// get array of all cities
api.get_cities = function(db, cb) {
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
            if (e || d.length == 0) return cb(e);
            cb1();
          }
        )
      },
      function(err) {
        if (e || d.length == 0) return cb(e);
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
            console.log('added new guess');
            res.redirect('/');
            cb(e, d);
          }
        )
      } else {
        console.log('found record and updated');
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

