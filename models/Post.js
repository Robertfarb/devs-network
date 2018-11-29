const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Profile Schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  
});

Profile = mongoose.model("post", PostSchema);
module.exports = PostSchema;
