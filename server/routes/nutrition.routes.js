const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');


router.use(protect);


router.get('/', nutritionController.getNutritionLogs);           
router.post('/', nutritionController.createNutritionLog);        
router.get('/:id', nutritionController.getNutritionLogById);     
router.put('/:id', nutritionController.updateNutritionLog);      
router.delete('/:id', nutritionController.deleteNutritionLog);

module.exports = router;