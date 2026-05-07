const Workout = require('../models/workout');
const mongoose = require('mongoose'); 
// Create Workout
exports.createWorkout = async (req, res) => {
  try {
    const { date, title, category, tags, exercises } = req.body;
    const user = req.user._id;  // from auth middleware

    const workout = new Workout({ user, date, title, category, tags, exercises });
    await workout.save();

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all workouts of logged-in user
exports.getWorkouts = async (req, res) => {
  try {
    const user = req.user._id;
    const workouts = await Workout.find({ user }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get workout by id
exports.getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    // Make sure workout belongs to user
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update workout by id
exports.updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { date, title, category, tags, exercises } = req.body;

    workout.date = date || workout.date;
    workout.title = title || workout.title;
    workout.category = category || workout.category;
    workout.tags = tags || workout.tags;
    workout.exercises = exercises || workout.exercises;

    await workout.save();

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Delete workout by id
exports.deleteWorkout = async (req, res) => {
  try {
    console.log('Deleting workout id:', req.params.id);
    console.log('Authenticated user id:', req.user?._id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workout ID' });
    }

    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Use deleteOne instead of remove
    await workout.deleteOne();

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};


