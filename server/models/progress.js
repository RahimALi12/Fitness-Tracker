const mongoose = require('mongoose');

const bodyMeasurementsSchema = new mongoose.Schema({
  chest: { type: Number },
  waist: { type: Number },
  hips: { type: Number },
  // add more measurements if needed
});

const performanceMetricsSchema = new mongoose.Schema({
  runTime: { type: Number },      // e.g., time in seconds
  liftingMax: { type: Number },   // e.g., max weight lifted
  // add more metrics if needed
});

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number },
  bodyMeasurements: bodyMeasurementsSchema,
  performanceMetrics: performanceMetricsSchema,
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
