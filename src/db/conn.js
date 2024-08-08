const mongoose = require('mongoose');

const uri = 'mongodb+srv://db_user:1234@cluster0.mongodb.net/featuredb?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connection established successfully'))
.catch(err => console.error('MongoDB connection error:', err));
