const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:admindb@learning.mh6j7.mongodb.net/featuredb?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connection established successfully'))
.catch(err => console.error('MongoDB connection error:', err));
