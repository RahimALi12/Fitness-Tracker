const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

router.post('/', workoutController.createWorkout);
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;
