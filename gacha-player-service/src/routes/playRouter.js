const express = require('express');
const router = express.Router();
const playController = require('../controllers/playController');

// API trừ lượt chơi và thêm item vào inventory
router.post('/use-play', playController.usePlayAndAddItem);
router.get('/playtime/:gameId', playController.getOrCreatePlaytime);
// API đổi quà
router.post('/redeem', playController.redeemPrize);
router.get("/inventory/:game_id", playController.getUserItems);
module.exports = router;
