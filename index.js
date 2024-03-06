const express = require('express');
const app = express();
const dotenv = require("dotenv").config({path: '.env'});
const mongoose = require('mongoose');
const path = require('path');


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);


app.use(express.static(path.join(__dirname, 'public')));


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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/api/users', (req, res) => {
  // Create a new user
  const { username } = req.body;
  const newUser = new User({ username });

  newUser.save((err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.json({ username: user.username, _id: user._id });
  });
});

app.get('/api/users', (req, res) => {
  // Get a list of all users
  User.find({}, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' });
    }
    res.json(users);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  // Add an exercise for a user
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  User.findById(userId, (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newExercise = new Exercise({
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    newExercise.save((err, exercise) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving exercise' });
      }

      user.log.push(exercise._id);
      user.save((err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating user' });
        }

        res.json({
          _id: user._id,
          username: user.username,
          date: exercise.date.toDateString(),
          duration: exercise.duration,
          description: exercise.description,
        });
      });
    });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  // Retrieve the exercise log of a user
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  User.findById(userId)
    .populate({
      path: 'log',
      match: {
        date: {
          $gte: from ? new Date(from) : new Date(0),
          $lte: to ? new Date(to) : new Date(),
        },
      },
      options: {
        limit: limit ? parseInt(limit) : Number.MAX_SAFE_INTEGER,
      },
    })
    .exec((err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const log = user.log.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      }));

      res.json({
        _id: user._id,
        username: user.username,
        count: user.log.length,
        log,
      });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});