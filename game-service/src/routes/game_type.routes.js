const express = require('express');
const router = express.Router();
const gameTypeController = require('../controllers/game_type.controller');

router.post('/', gameTypeController.createGameType);
router.delete('/:id', gameTypeController.deleteGameType);
router.put('/:id', gameTypeController.updateGameType);
router.get('/all', gameTypeController.getAllGameTypes);
router.get('/:id', gameTypeController.getGameTypeById);

module.exports = router;