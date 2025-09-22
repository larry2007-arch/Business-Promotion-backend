const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Mongoose model we created
const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows us to talk to the front-end
app.use(express.json()); // Allows us to read JSON data sent from the front-end

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

/* --- API Endpoints --- */

// GET route to fetch all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST route to create a new post
app.post('/api/posts', async (req, res) => {
  const { title, description, contact } = req.body;
  const newPost = new Post({
    title,
    description,
    contact
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST route to add a new comment to a specific post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    // Find the post by its ID from the URL parameter
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Add the new comment to the post's comments array
    const { author, text } = req.body;
    post.comments.push({ author, text });

    // Save the updated post back to the database
    const updatedPost = await post.save();
    res.status(201).json(updatedPost);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* --- Scheduled Deletion (for 30 days) --- */

// This will run a check every day (86400000 ms) to delete old posts
setInterval(async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await Post.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
  console.log('Old posts have been deleted.');
}, 86400000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
