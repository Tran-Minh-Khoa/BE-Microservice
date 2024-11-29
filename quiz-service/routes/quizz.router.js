const express = require('express');
const router = express.Router();
const questionController = require('../controllers/quizz.controller.js')

router.post('/addQuizz', questionController.addQuizListController)
router.put('/updateQuizz/:id', questionController.updateQuizListController)
router.get('/:id', questionController.getQuizListByIdController);

module.exports = router
