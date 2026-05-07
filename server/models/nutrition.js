const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
  macros: macroSchema,
});

const nutritionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
  foodItems: [foodItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('NutritionLog', nutritionLogSchema);
