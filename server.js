const express = require('express');
const mongoose = require('mongoose');

// Initialize express app
const app = express();

//DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mlab MongoDB
mongoose.connect(db)
  .then(console.log("mongoDB connected"))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello');
});
  
// Start App on localhost:5000
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));
