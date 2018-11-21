const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const bodyParser = require('body-parser');
const passport = require('passport');

// Initialize express app
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mlab MongoDB
mongoose.connect(db)
  .then(console.log("mongoDB connected"))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  // Route to the root of the application
  res.send('Hello, this is the root of my Dev Network Application :)');
});

// Passport middleware initilization
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

//Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);  

// Start App on localhost:5000
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`server running on port ${port}`));
