const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });
const gachaController = require("../controllers/gachaController");

// API tạo gachaData
router.post("/create", multerUpload.fields([
  { name: 'img_1', maxCount: 1 },
  { name: 'img_2', maxCount: 1 },
  { name: 'img_3', maxCount: 1 },
  { name: 'img_4', maxCount: 1 },
  { name: 'img_5', maxCount: 1 },
  { name: 'img_6', maxCount: 1 }
]), gachaController.createGachaData);
router.post("/edit/:gachaDataId", multerUpload.fields([
  { name: 'img_1', maxCount: 1 },
  { name: 'img_2', maxCount: 1 },
  { name: 'img_3', maxCount: 1 },
  { name: 'img_4', maxCount: 1 },
  { name: 'img_5', maxCount: 1 },
  { name: 'img_6', maxCount: 1 }
]), gachaController.editGachaData);

router.post('/items', gachaController.getItemsByIds);
router.get('/itemsByGame/:gameId', gachaController.getItemsByGameId);
router.get('/itemSetByGameID/:gameId', gachaController.getItemSetsByGameId);
router.get('/itemSet/:itemSetId', gachaController.getItemSetById);

module.exports = router;
