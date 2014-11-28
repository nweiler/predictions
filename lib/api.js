var api = exports = module.exports = {},
    async = require('async');

api.get_users = function(db, cb) {
  db.collection('guesses').distinct('name', function(e, d) {
    if (e || d.length == 0) return cb(e, null);
    cb(e, d);
  })
}

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

/*
api.get_one_guess = function(req, res, db, cb) {
  var name = req.params.name;
  db.collection('guesses').find( { "name": name }).toArray(function(e, d) {
    if (e || d.length == 0) return cb(e, null);
    cb(e, d);
  })
}
*/

//api.get_all_guesses = function(req, res, db, cb) {
api.get_all_guesses = function(name, db, cb) {
  //var name = req.params.name;
  var name = name;
  db.collection('guesses').find({ 'name': name }, { 'guesses': 1 }).toArray(function(e, d) {
    var guesses = [];
    async.each(d,
      function(guess, cb1) {
        guesses.push(guess);
        cb1();
      },
      function(err) {
        if (e || d.length == 0) return cb(e, null);
        cb(e, d);
      }
    )
  })
}

api.create = function(req, res, db, cb) {
  var name = req.body.name.toLowerCase(),
      city = req.body.city,
      date = req.body.date,
      year = req.body.year,
      q = { 'name':name, 'city':city, 'date':new Date(date), 'year': year };
  db.collection('guesses').insert(q, function(e, d) {
    res.redirect('/');
    if (e) return cb(e, null);
    cb ? cb(e, d) : console.log(d);
  })
}

api.upsert_guess = function(req, res, db, cb) {
  var name = req.body.name.toLowerCase(),
      city = req.body.city,
      date = req.body.date,
      year = req.body.year,
      q = { 'name': name, 'city': city, 'year': year },
      u = { 'name': name, 'city': city, 'year': year, 'date': new Date(date) };
      //u = { $set: { date: new Date(date) } };

  db.collection('guesses').update(
    q, u, { upsert: true, multi: true },
    function(e, d) {
      res.redirect('/');
      cb(e, d);
    }
  )
}
