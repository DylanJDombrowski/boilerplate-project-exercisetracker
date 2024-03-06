const express = require('express');
const app = express();
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define User and Exercise models
const userSchema = new mongoose.Schema({
  username: String,
  log: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
});

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', (req, res) => {
  // Create a new user
});

app.get('/api/users', (req, res) => {
  // Get a list of all users
});

app.post('/api/users/:_id/exercises', (req, res) => {
  // Add an exercise for a user
});

app.get('/api/users/:_id/logs', (req, res) => {
  // Retrieve the exercise log of a user
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});