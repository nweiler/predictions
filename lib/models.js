var mongoose = require('mongoose'),
  
  user = mongoose.model('guess',
  { 
    name: String,
    guesses: {
      city: {
        year: String,
        date: Date
      }
    }
  })

/*
{ "name": "nick",
  "guesses": [
    { "city": "south bend", "year': "2013": "date": "12/1/13" },
    { "city": "south bend", "year': "2014": "date": "12/1/14" },
    { "city": "south bend", "year': "2015": "date": "12/1/15" }
    }
  }
}
*/

/*
{ "name": "nick",
  "guesses": {
    "south bend": {
      "2013": "12/1/13" ,
      "2014": "12/1/14" ,
      "2015": "12/1/15" 
    }
  }
}
        


*/

/*
{ "name": "nick",
  "guesses": {
    "south bend": [
      { "year": "2012", "date": 12/1/12 },
      { "year": "2013", "date": 12/1/13 },
      { "year": "2014", "date": 12/1/14 }
    ],
    "columbus": [
      { "year": "2012", "date": 12/1/12 },
      { "year": "2013", "date": 12/1/13 },
      { "year": "2014", "date": 12/1/14 }
    ]
  }
}
*/

/* OLD
{ name: "nick", city: "columbus", date: ISODate("2013-12-20T05:00:00Z"), year: "2013", _id: ObjectId("5475470f349ce2fe368fb477") }
*/
