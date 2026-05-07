// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');// assuming JWT/auth is setup

router.use(protect); // protect all routes

router.post('/', progressController.createProgress);
router.get('/', progressController.getAllProgress);
router.get('/:id', progressController.getProgressById);
router.put('/:id', progressController.updateProgress);
router.delete('/:id', progressController.deleteProgress);

module.exports = router;
