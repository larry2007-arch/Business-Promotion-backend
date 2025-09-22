const mongoose = require('mongoose');

// We'll create a nested schema for comments
const CommentSchema = new mongoose.Schema({
  author: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

// The main schema for a post
const PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  contact: String,
  // Add an array to hold the comments
  comments: [CommentSchema],
  // Add a creation date to handle the 30-day deletion
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
