const mongoose = require('mongoose');

// Define a schema for the feedback object
const feedbackSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
});

// Create a Mongoose model based on the feedback schema
module.exports = mongoose.model('Feedback', feedbackSchema);
