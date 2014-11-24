var mongoose = require('mongoose'),
  
  guess = mongoose.model('guess',
  { 
    name: String,
    date: Date,
    location: String,
    year: Number
  });
