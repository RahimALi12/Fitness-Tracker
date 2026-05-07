const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: false },
  notes: { type: String, default: '' },
});

const workoutSchema = new mongoose.Schema({
   date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['strength', 'cardio', 'flexibility', 'balance'], default: 'strength' },
  tags: [{ type: String }],
  exercises: [exerciseSchema],
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
