const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game.controller");
const multer = require("multer");
const multerStorage = multer.memoryStorage();

const multerUpload = multer({ storage: multerStorage });

router.post("/", multerUpload.single("poster"), gameController.createGame);
router.put('/:id',multerUpload.single("poster"), gameController.updateGame);
router.delete('/:id', gameController.deleteGame);
router.get('/all', gameController.getAllGames);
router.get('/search', gameController.searchGames);
router.get('/highlighted', gameController.getHighlightedGames);
router.get('/by-brand-id/', gameController.getGamesByBrandId);
router.get('/active-games-count', gameController.getActiveGamesCount);
router.get('/games-count-by-day', gameController.getGamesCountByDay);
router.get('/:id', gameController.getGameById);
router.get('/event/:eventId', gameController.getGamesByEvent);
router.get('/noEvent/upcoming', gameController.getGamesWithoutEventAndNotStarted);
router.post('/addEvent/:gameId', gameController.addEventToGame);

module.exports = router;
