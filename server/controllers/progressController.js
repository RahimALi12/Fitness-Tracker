// controllers/progressController.js
const Progress = require('../models/progress');

// CREATE
exports.createProgress = async (req, res) => {
  try {
    const newProgress = new Progress({
      user: req.user._id, // make sure req.user is set via auth middleware
      ...req.body,
    });
    const savedProgress = await newProgress.save();
    res.status(201).json(savedProgress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create progress entry' });
  }
};

// GET ALL progress entries of a user
exports.getAllProgress = async (req, res) => {
  try {
    const progressLogs = await Progress.find({ user: req.user._id }).sort({ date: -1 });
    res.json(progressLogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress entries' });
  }
};

// GET SINGLE progress entry by ID
exports.getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findOne({ _id: req.params.id, user: req.user._id });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get progress entry' });
  }
};

// UPDATE
exports.updateProgress = async (req, res) => {
  try {
    const updatedProgress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedProgress) return res.status(404).json({ error: 'Progress not found' });
    res.json(updatedProgress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

// DELETE
exports.deleteProgress = async (req, res) => {
  try {
    const deleted = await Progress.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: 'Progress not found' });
    res.json({ message: 'Progress deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete progress' });
  }
};
