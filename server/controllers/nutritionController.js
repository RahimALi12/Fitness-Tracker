const NutritionLog = require('../models/nutrition');
const mongoose = require('mongoose');

// Create Nutrition Log
exports.createNutritionLog = async (req, res) => {
  try {
    const { date, mealType, foodItems } = req.body;
    const user = req.user._id; // from auth middleware

    // Validation
    if (!date || !mealType || !foodItems || foodItems.length === 0) {
      return res.status(400).json({ 
        message: 'Date, meal type, and at least one food item are required' 
      });
    }

    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ 
        message: 'Invalid meal type. Must be breakfast, lunch, dinner, or snack' 
      });
    }

    const nutritionLog = new NutritionLog({ 
      user, 
      date, 
      mealType, 
      foodItems 
    });
    
    await nutritionLog.save();
    res.status(201).json(nutritionLog);
  } catch (error) {
    console.error('Create nutrition log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all nutrition logs of logged-in user
exports.getNutritionLogs = async (req, res) => {
  try {
    const user = req.user._id;
    const nutritionLogs = await NutritionLog.find({ user }).sort({ date: -1, createdAt: -1 });
    res.json(nutritionLogs);
  } catch (error) {
    console.error('Get nutrition logs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get nutrition log by id
exports.getNutritionLogById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nutrition log ID' });
    }

    const nutritionLog = await NutritionLog.findById(req.params.id);
    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    // Make sure nutrition log belongs to user
    if (nutritionLog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(nutritionLog);
  } catch (error) {
    console.error('Get nutrition log by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update nutrition log by id
exports.updateNutritionLog = async (req, res) => {
  try {
    
    const { id } = req.params;
    // const { date, mealType, foodItems } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nutrition log ID' });
    }

    const nutritionLog = await NutritionLog.findById(req.params.id);
    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    if (nutritionLog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { date, mealType, foodItems } = req.body;

    // Validate meal type if provided
    if (mealType) {
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(mealType)) {
        return res.status(400).json({ 
          message: 'Invalid meal type. Must be breakfast, lunch, dinner, or snack' 
        });
      }
    }

    nutritionLog.date = date || nutritionLog.date;
    nutritionLog.mealType = mealType || nutritionLog.mealType;
    nutritionLog.foodItems = foodItems || nutritionLog.foodItems;

    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    console.error('Update nutrition log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete nutrition log by id
exports.deleteNutritionLog = async (req, res) => {
  try {
    console.log('Deleting nutrition log id:', req.params.id);
    console.log('Authenticated user id:', req.user?._id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid nutrition log ID' });
    }

    const nutritionLog = await NutritionLog.findById(req.params.id);
    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    if (nutritionLog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Use deleteOne instead of remove
    await nutritionLog.deleteOne();
    res.json({ message: 'Nutrition log deleted successfully' });
  } catch (error) {
    console.error('Delete nutrition log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get nutrition logs by date
exports.getNutritionLogsByDate = async (req, res) => {
  try {
    const user = req.user._id;
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const nutritionLogs = await NutritionLog.find({
      user: user,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    res.json(nutritionLogs);
  } catch (error) {
    console.error('Get nutrition logs by date error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get nutrition summary for date range
exports.getNutritionSummary = async (req, res) => {
  try {
    const user = req.user._id;
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    
    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const logs = await NutritionLog.find({
      user: user,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let mealTypeCounts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    };

    logs.forEach(log => {
      mealTypeCounts[log.mealType] = (mealTypeCounts[log.mealType] || 0) + 1;
      
      log.foodItems.forEach(item => {
        totalCalories += item.calories || 0;
        totalProtein += item.macros?.protein || 0;
        totalCarbs += item.macros?.carbs || 0;
        totalFat += item.macros?.fat || 0;
      });
    });

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    res.json({
      totalLogs: logs.length,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: daysDiff
      },
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      },
      averages: {
        caloriesPerDay: daysDiff > 0 ? Math.round(totalCalories / daysDiff) : 0,
        proteinPerDay: daysDiff > 0 ? Math.round((totalProtein / daysDiff) * 10) / 10 : 0,
        carbsPerDay: daysDiff > 0 ? Math.round((totalCarbs / daysDiff) * 10) / 10 : 0,
        fatPerDay: daysDiff > 0 ? Math.round((totalFat / daysDiff) * 10) / 10 : 0
      },
      mealTypeBreakdown: mealTypeCounts
    });
  } catch (error) {
    console.error('Get nutrition summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

